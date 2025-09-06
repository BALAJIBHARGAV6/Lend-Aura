module aura_lend::loan_vault {
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aura_lend::events;
    use aura_lend::property_nft;
    use aura_lend::registry;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_LOAN_NOT_FOUND: u64 = 2;
    const E_LOAN_ALREADY_FUNDED: u64 = 3;
    const E_LOAN_NOT_FUNDED: u64 = 4;
    const E_LOAN_ALREADY_REPAID: u64 = 5;
    const E_INSUFFICIENT_COLLATERAL: u64 = 6;
    const E_LOAN_NOT_DUE: u64 = 7;
    const E_LOAN_OVERDUE: u64 = 8;
    const E_INVALID_AMOUNT: u64 = 9;

    /// Loan request status
    const LOAN_REQUESTED: u8 = 0;
    const LOAN_FUNDED: u8 = 1;
    const LOAN_REPAID: u8 = 2;
    const LOAN_DEFAULTED: u8 = 3;

    /// Loan request structure
    struct LoanRequest has key, store, drop {
        loan_id: u64,
        borrower: address,
        nft_owner: address,
        collateral_nft_id: u64,
        amount_requested: u64,
        interest_rate: u64, // basis points (100 = 1%)
        duration_days: u64,
        lender: address,
        funded_amount: u64,
        repaid_amount: u64,
        created_at: u64,
        funded_at: u64,
        due_date: u64,
        repaid_at: u64,
        status: u8,
    }

    /// Global loan registry
    struct LoanRegistry has key {
        next_loan_id: u64,
        total_loans_created: u64,
        total_amount_lent: u64,
        total_amount_repaid: u64,
    }

    /// User's loan storage
    struct UserLoans has key {
        borrowed_loans: vector<u64>,
        lent_loans: vector<u64>,
    }

    /// Global loan storage
    struct LoanStorage has key {
        loans: vector<LoanRequest>,
    }

    /// Initialize the module
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, LoanRegistry {
            next_loan_id: 1,
            total_loans_created: 0,
            total_amount_lent: 0,
            total_amount_repaid: 0,
        });

        move_to(admin, LoanStorage {
            loans: vector::empty(),
        });
    }

    /// Create a loan request with NFT as collateral
    public entry fun create_loan_request(
        borrower: &signer,
        nft_owner: address,
        collateral_nft_id: u64,
        amount_requested: u64,
        interest_rate: u64,
        duration_days: u64,
    ) acquires LoanRegistry, LoanStorage, UserLoans {
        let borrower_addr = signer::address_of(borrower);
        
        // Verify NFT exists and is attested
        assert!(property_nft::property_exists(nft_owner, collateral_nft_id), error::not_found(E_INSUFFICIENT_COLLATERAL));
        assert!(property_nft::is_property_attested(nft_owner, collateral_nft_id), error::invalid_state(E_INSUFFICIENT_COLLATERAL));
        
        // Get next loan ID
        let registry = borrow_global_mut<LoanRegistry>(@aura_lend);
        let loan_id = registry.next_loan_id;
        registry.next_loan_id = loan_id + 1;
        registry.total_loans_created = registry.total_loans_created + 1;

        // Create loan request
        let loan_request = LoanRequest {
            loan_id,
            borrower: borrower_addr,
            nft_owner,
            collateral_nft_id,
            amount_requested,
            interest_rate,
            duration_days,
            lender: @0x0,
            funded_amount: 0,
            repaid_amount: 0,
            created_at: timestamp::now_seconds(),
            funded_at: 0,
            due_date: 0,
            repaid_at: 0,
            status: LOAN_REQUESTED,
        };

        // Store loan
        let storage = borrow_global_mut<LoanStorage>(@aura_lend);
        vector::push_back(&mut storage.loans, loan_request);

        // Update user's loan tracking
        if (!exists<UserLoans>(borrower_addr)) {
            move_to(borrower, UserLoans {
                borrowed_loans: vector::empty(),
                lent_loans: vector::empty(),
            });
        };
        
        let user_loans = borrow_global_mut<UserLoans>(borrower_addr);
        vector::push_back(&mut user_loans.borrowed_loans, loan_id);

        // Emit event
        events::emit_loan_opened(loan_id, borrower_addr, collateral_nft_id, amount_requested, interest_rate, duration_days * 24 * 60 * 60, timestamp::now_seconds());
    }

    /// Fund a loan request
    public entry fun fund_loan(
        lender: &signer,
        loan_id: u64,
    ) acquires LoanStorage, UserLoans, LoanRegistry {
        let lender_addr = signer::address_of(lender);
        
        // Find and update loan
        let storage = borrow_global_mut<LoanStorage>(@aura_lend);
        let loan_index = find_loan_index(&storage.loans, loan_id);
        let loan = vector::borrow_mut(&mut storage.loans, loan_index);
        
        assert!(loan.status == LOAN_REQUESTED, error::invalid_state(E_LOAN_ALREADY_FUNDED));
        
        // Transfer funds from lender to borrower
        let amount = loan.amount_requested;
        coin::transfer<AptosCoin>(lender, loan.borrower, amount);
        
        // Update loan
        loan.lender = lender_addr;
        loan.funded_amount = amount;
        loan.funded_at = timestamp::now_seconds();
        loan.due_date = timestamp::now_seconds() + (loan.duration_days * 24 * 60 * 60);
        loan.status = LOAN_FUNDED;

        // Update registry
        let registry = borrow_global_mut<LoanRegistry>(@aura_lend);
        registry.total_amount_lent = registry.total_amount_lent + amount;

        // Update lender's tracking
        if (!exists<UserLoans>(lender_addr)) {
            move_to(lender, UserLoans {
                borrowed_loans: vector::empty(),
                lent_loans: vector::empty(),
            });
        };
        
        let user_loans = borrow_global_mut<UserLoans>(lender_addr);
        vector::push_back(&mut user_loans.lent_loans, loan_id);

        // Update reputation
        registry::record_loan_funded(lender_addr, loan.borrower, amount);

        // Emit event
        events::emit_loan_funded(loan_id, lender_addr, loan.borrower, amount, timestamp::now_seconds());
    }

    /// Repay a loan
    public entry fun repay_loan(
        borrower: &signer,
        loan_id: u64,
        repayment_amount: u64,
    ) acquires LoanStorage, LoanRegistry {
        let borrower_addr = signer::address_of(borrower);
        
        // Find loan
        let storage = borrow_global_mut<LoanStorage>(@aura_lend);
        let loan_index = find_loan_index(&storage.loans, loan_id);
        let loan = vector::borrow_mut(&mut storage.loans, loan_index);
        
        assert!(loan.borrower == borrower_addr, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(loan.status == LOAN_FUNDED, error::invalid_state(E_LOAN_NOT_FUNDED));
        
        // Calculate total amount due (principal + interest)
        let interest_amount = (loan.funded_amount * loan.interest_rate) / 10000;
        let total_due = loan.funded_amount + interest_amount;
        
        assert!(repayment_amount >= total_due, error::invalid_argument(E_INVALID_AMOUNT));
        
        // Transfer repayment to lender
        coin::transfer<AptosCoin>(borrower, loan.lender, repayment_amount);
        
        // Update loan
        loan.repaid_amount = repayment_amount;
        loan.repaid_at = timestamp::now_seconds();
        loan.status = LOAN_REPAID;

        // Update registry
        let registry = borrow_global_mut<LoanRegistry>(@aura_lend);
        registry.total_amount_repaid = registry.total_amount_repaid + repayment_amount;

        // Update reputation
        registry::record_loan_repaid(borrower_addr, loan.lender, repayment_amount, true);

        // Emit event
        events::emit_loan_repaid(loan_id, borrower_addr, loan.lender, repayment_amount, timestamp::now_seconds());
    }

    /// Mark loan as defaulted (can be called by anyone after due date)
    public entry fun mark_loan_defaulted(
        _caller: &signer,
        loan_id: u64,
    ) acquires LoanStorage {
        let storage = borrow_global_mut<LoanStorage>(@aura_lend);
        let loan_index = find_loan_index(&storage.loans, loan_id);
        let loan = vector::borrow_mut(&mut storage.loans, loan_index);
        
        assert!(loan.status == LOAN_FUNDED, error::invalid_state(E_LOAN_NOT_FUNDED));
        assert!(timestamp::now_seconds() > loan.due_date, error::invalid_state(E_LOAN_NOT_DUE));
        
        // Update loan status
        loan.status = LOAN_DEFAULTED;

        // Update reputation (negative impact)
        registry::record_loan_repaid(loan.borrower, loan.lender, 0, false);

        // Emit event
        events::emit_default_triggered(loan_id, loan.borrower, loan.lender, loan.collateral_nft_id, timestamp::now_seconds());
    }

    /// Helper function to find loan index
    fun find_loan_index(loans: &vector<LoanRequest>, loan_id: u64): u64 {
        let len = vector::length(loans);
        let i = 0;
        while (i < len) {
            let loan = vector::borrow(loans, i);
            if (loan.loan_id == loan_id) {
                return i
            };
            i = i + 1;
        };
        abort error::not_found(E_LOAN_NOT_FOUND)
    }

    /// Get loan details
    public fun get_loan(loan_id: u64): (u64, address, address, u64, u64, u64, u64, address, u64, u64, u64, u64, u64, u64, u8) acquires LoanStorage {
        let storage = borrow_global<LoanStorage>(@aura_lend);
        let loan_index = find_loan_index(&storage.loans, loan_id);
        let loan = vector::borrow(&storage.loans, loan_index);
        
        (
            loan.loan_id,
            loan.borrower,
            loan.nft_owner,
            loan.collateral_nft_id,
            loan.amount_requested,
            loan.interest_rate,
            loan.duration_days,
            loan.lender,
            loan.funded_amount,
            loan.repaid_amount,
            loan.created_at,
            loan.funded_at,
            loan.due_date,
            loan.repaid_at,
            loan.status,
        )
    }

    /// Get all available loan requests
    public fun get_available_loans(): vector<u64> acquires LoanStorage {
        let storage = borrow_global<LoanStorage>(@aura_lend);
        let available_loans = vector::empty<u64>();
        
        let len = vector::length(&storage.loans);
        let i = 0;
        while (i < len) {
            let loan = vector::borrow(&storage.loans, i);
            if (loan.status == LOAN_REQUESTED) {
                vector::push_back(&mut available_loans, loan.loan_id);
            };
            i = i + 1;
        };
        
        available_loans
    }

    /// Get user's loan IDs
    public fun get_user_loans(user: address): (vector<u64>, vector<u64>) acquires UserLoans {
        if (!exists<UserLoans>(user)) {
            return (vector::empty(), vector::empty())
        };
        
        let user_loans = borrow_global<UserLoans>(user);
        (user_loans.borrowed_loans, user_loans.lent_loans)
    }

    /// Get registry stats
    public fun get_registry_stats(): (u64, u64, u64, u64) acquires LoanRegistry {
        let registry = borrow_global<LoanRegistry>(@aura_lend);
        (
            registry.next_loan_id - 1,
            registry.total_loans_created,
            registry.total_amount_lent,
            registry.total_amount_repaid,
        )
    }
}
