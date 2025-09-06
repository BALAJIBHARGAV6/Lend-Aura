#[test_only]
module aura_lend::loan_vault_tests {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    use aptos_framework::account;
    use aura_lend::loan_vault;
    use aura_lend::property_nft;
    use aura_lend::registry;

    #[test(admin = @aura_lend, borrower = @0x123, lender = @0x456, aptos_framework = @aptos_framework)]
    public fun test_loan_lifecycle(
        admin: &signer,
        borrower: &signer,
        lender: &signer,
        aptos_framework: &signer,
    ) {
        // Initialize timestamp and framework
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        // Set up accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(borrower));
        account::create_account_for_test(signer::address_of(lender));
        
        // Register coin stores
        coin::register<AptosCoin>(borrower);
        coin::register<AptosCoin>(lender);
        
        // Mint some coins for testing
        let borrower_coins = coin::mint<AptosCoin>(1000000000, &mint_cap); // 10 APT
        let lender_coins = coin::mint<AptosCoin>(10000000000, &mint_cap); // 100 APT
        
        coin::deposit(signer::address_of(borrower), borrower_coins);
        coin::deposit(signer::address_of(lender), lender_coins);
        
        // Initialize modules (this would normally happen on deployment)
        property_nft::add_attestor(admin, signer::address_of(admin));
        
        // Test 1: Mint and attest a property NFT
        property_nft::mint_property_nft(
            borrower,
            b"QmTest123PropertyValuationHash",
            std::string::utf8(b"https://ipfs.io/ipfs/QmTest123")
        );
        
        property_nft::attest_property_nft(
            admin,
            1, // property_id
            signer::address_of(borrower)
        );
        
        // Verify NFT is attested
        assert!(property_nft::is_property_attested(1, signer::address_of(borrower)), 0);
        
        // Test 2: Create loan request
        loan_vault::create_loan_request(
            borrower,
            1, // nft_id
            signer::address_of(borrower), // nft_owner
            5000000000, // 50 APT loan amount
            1000, // 10% interest rate (1000 bps)
            86400 * 30 // 30 days duration
        );
        
        // Verify loan request was created
        let active_requests = loan_vault::get_active_loan_requests();
        assert!(vector::length(&active_requests) == 1, 1);
        assert!(*vector::borrow(&active_requests, 0) == 1, 2);
        
        // Test 3: Fund the loan
        loan_vault::fund_loan(
            lender,
            1, // loan_id
            signer::address_of(borrower)
        );
        
        // Verify loan was funded
        let active_loans = loan_vault::get_active_loans();
        assert!(vector::length(&active_loans) == 1, 3);
        
        // Check balances after funding
        let borrower_balance = coin::balance<AptosCoin>(signer::address_of(borrower));
        assert!(borrower_balance == 6000000000, 4); // Original 10 APT + 50 APT loan = 60 APT
        
        // Test 4: Repay the loan
        // Calculate repayment amount (principal + interest)
        let repayment_amount = 5000000000 + (5000000000 * 1000) / 10000; // 50 APT + 5 APT interest = 55 APT
        
        loan_vault::repay_loan(
            borrower,
            1, // loan_id
            signer::address_of(lender)
        );
        
        // Verify loan was repaid
        let final_active_loans = loan_vault::get_active_loans();
        assert!(vector::length(&final_active_loans) == 0, 5);
        
        // Check final balances
        let final_borrower_balance = coin::balance<AptosCoin>(signer::address_of(borrower));
        let final_lender_balance = coin::balance<AptosCoin>(signer::address_of(lender));
        
        // Borrower should have: 60 APT - 55 APT repayment = 5 APT
        assert!(final_borrower_balance == 500000000, 6);
        
        // Lender should have: 100 APT - 50 APT loan + 55 APT repayment = 105 APT
        assert!(final_lender_balance == 10500000000, 7);
        
        // Test 5: Check registry records
        let (total_loans, loans_repaid, loans_defaulted, _, _, repayment_score, is_blacklisted, _, _) = 
            registry::get_borrower_profile(signer::address_of(borrower));
        
        assert!(total_loans == 1, 8);
        assert!(loans_repaid == 1, 9);
        assert!(loans_defaulted == 0, 10);
        assert!(repayment_score == 1000, 11); // Perfect score
        assert!(!is_blacklisted, 12);
        
        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
    
    #[test(admin = @aura_lend, borrower = @0x123, lender = @0x456, aptos_framework = @aptos_framework)]
    public fun test_loan_default(
        admin: &signer,
        borrower: &signer,
        lender: &signer,
        aptos_framework: &signer,
    ) {
        // Initialize timestamp and framework
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        // Set up accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(borrower));
        account::create_account_for_test(signer::address_of(lender));
        
        // Register coin stores
        coin::register<AptosCoin>(borrower);
        coin::register<AptosCoin>(lender);
        
        // Mint some coins for testing
        let lender_coins = coin::mint<AptosCoin>(10000000000, &mint_cap); // 100 APT
        coin::deposit(signer::address_of(lender), lender_coins);
        
        // Initialize modules
        property_nft::add_attestor(admin, signer::address_of(admin));
        
        // Mint and attest NFT
        property_nft::mint_property_nft(
            borrower,
            b"QmTest456PropertyValuationHash",
            std::string::utf8(b"https://ipfs.io/ipfs/QmTest456")
        );
        
        property_nft::attest_property_nft(
            admin,
            1, // property_id
            signer::address_of(borrower)
        );
        
        // Create and fund loan with short duration
        loan_vault::create_loan_request(
            borrower,
            1, // nft_id
            signer::address_of(borrower), // nft_owner
            5000000000, // 50 APT loan amount
            1000, // 10% interest rate
            60 // 1 minute duration for testing
        );
        
        loan_vault::fund_loan(
            lender,
            1, // loan_id
            signer::address_of(borrower)
        );
        
        // Fast forward time to make loan overdue
        timestamp::fast_forward_seconds(120); // 2 minutes
        
        // Verify loan is overdue
        assert!(loan_vault::is_loan_overdue(1, signer::address_of(lender)), 0);
        
        // Claim defaulted collateral
        loan_vault::claim_defaulted_collateral(
            lender,
            1 // loan_id
        );
        
        // Verify loan was marked as defaulted
        let final_active_loans = loan_vault::get_active_loans();
        assert!(vector::length(&final_active_loans) == 0, 1);
        
        // Check that default was recorded in registry
        let (_, _, loans_defaulted, _, _, repayment_score, is_blacklisted, _, _) = 
            registry::get_borrower_profile(signer::address_of(borrower));
        
        assert!(loans_defaulted == 1, 2);
        assert!(repayment_score < 1000, 3); // Score should be reduced
        
        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
