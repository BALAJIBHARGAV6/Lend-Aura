module aura_lend::registry {
    use std::signer;
    use std::error;
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_USER_NOT_FOUND: u64 = 2;

    /// User reputation data
    struct UserReputation has key, store, drop, copy {
        user_address: address,
        total_borrowed: u64,
        total_lent: u64,
        total_repaid: u64,
        loans_taken: u64,
        loans_given: u64,
        successful_repayments: u64,
        defaulted_loans: u64,
        reputation_score: u64,
        joined_at: u64,
        last_activity: u64,
    }

    /// Global registry
    struct GlobalRegistry has key {
        user_reputations: SimpleMap<address, UserReputation>,
        total_users: u64,
        total_volume: u64,
    }

    /// Initialize the registry
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, GlobalRegistry {
            user_reputations: simple_map::create(),
            total_users: 0,
            total_volume: 0,
        });
    }

    /// Register a new user or get existing user reputation
    public fun get_or_create_user_reputation(user_address: address): UserReputation acquires GlobalRegistry {
        let registry = borrow_global_mut<GlobalRegistry>(@aura_lend);
        
        if (simple_map::contains_key(&registry.user_reputations, &user_address)) {
            *simple_map::borrow(&registry.user_reputations, &user_address)
        } else {
            let new_reputation = UserReputation {
                user_address,
                total_borrowed: 0,
                total_lent: 0,
                total_repaid: 0,
                loans_taken: 0,
                loans_given: 0,
                successful_repayments: 0,
                defaulted_loans: 0,
                reputation_score: 100, // Start with neutral score
                joined_at: timestamp::now_seconds(),
                last_activity: timestamp::now_seconds(),
            };
            
            simple_map::add(&mut registry.user_reputations, user_address, new_reputation);
            registry.total_users = registry.total_users + 1;
            
            new_reputation
        }
    }

    /// Record when a loan is funded
    public fun record_loan_funded(lender: address, borrower: address, amount: u64) acquires GlobalRegistry {
        let registry = borrow_global_mut<GlobalRegistry>(@aura_lend);
        
        // Update lender reputation
        if (simple_map::contains_key(&registry.user_reputations, &lender)) {
            let lender_rep = simple_map::borrow_mut(&mut registry.user_reputations, &lender);
            lender_rep.total_lent = lender_rep.total_lent + amount;
            lender_rep.loans_given = lender_rep.loans_given + 1;
            lender_rep.last_activity = timestamp::now_seconds();
            lender_rep.reputation_score = lender_rep.reputation_score + 5; // Bonus for lending
        } else {
            let new_lender_rep = UserReputation {
                user_address: lender,
                total_borrowed: 0,
                total_lent: amount,
                total_repaid: 0,
                loans_taken: 0,
                loans_given: 1,
                successful_repayments: 0,
                defaulted_loans: 0,
                reputation_score: 105, // Start with neutral + bonus
                joined_at: timestamp::now_seconds(),
                last_activity: timestamp::now_seconds(),
            };
            simple_map::add(&mut registry.user_reputations, lender, new_lender_rep);
            registry.total_users = registry.total_users + 1;
        };

        // Update borrower reputation
        if (simple_map::contains_key(&registry.user_reputations, &borrower)) {
            let borrower_rep = simple_map::borrow_mut(&mut registry.user_reputations, &borrower);
            borrower_rep.total_borrowed = borrower_rep.total_borrowed + amount;
            borrower_rep.loans_taken = borrower_rep.loans_taken + 1;
            borrower_rep.last_activity = timestamp::now_seconds();
        } else {
            let new_borrower_rep = UserReputation {
                user_address: borrower,
                total_borrowed: amount,
                total_lent: 0,
                total_repaid: 0,
                loans_taken: 1,
                loans_given: 0,
                successful_repayments: 0,
                defaulted_loans: 0,
                reputation_score: 100,
                joined_at: timestamp::now_seconds(),
                last_activity: timestamp::now_seconds(),
            };
            simple_map::add(&mut registry.user_reputations, borrower, new_borrower_rep);
            registry.total_users = registry.total_users + 1;
        };

        registry.total_volume = registry.total_volume + amount;
    }

    /// Record when a loan is repaid (or defaulted)
    public fun record_loan_repaid(borrower: address, lender: address, amount: u64, is_successful: bool) acquires GlobalRegistry {
        let registry = borrow_global_mut<GlobalRegistry>(@aura_lend);
        
        // Update borrower reputation
        if (simple_map::contains_key(&registry.user_reputations, &borrower)) {
            let borrower_rep = simple_map::borrow_mut(&mut registry.user_reputations, &borrower);
            borrower_rep.total_repaid = borrower_rep.total_repaid + amount;
            borrower_rep.last_activity = timestamp::now_seconds();
            
            if (is_successful) {
                borrower_rep.successful_repayments = borrower_rep.successful_repayments + 1;
                borrower_rep.reputation_score = borrower_rep.reputation_score + 10; // Bonus for repaying
            } else {
                borrower_rep.defaulted_loans = borrower_rep.defaulted_loans + 1;
                // Penalty for defaulting (but don't go below 0)
                if (borrower_rep.reputation_score >= 30) {
                    borrower_rep.reputation_score = borrower_rep.reputation_score - 30;
                } else {
                    borrower_rep.reputation_score = 0;
                };
            };
        };

        // Update lender reputation  
        if (simple_map::contains_key(&registry.user_reputations, &lender)) {
            let lender_rep = simple_map::borrow_mut(&mut registry.user_reputations, &lender);
            lender_rep.last_activity = timestamp::now_seconds();
            
            if (is_successful) {
                lender_rep.reputation_score = lender_rep.reputation_score + 2; // Small bonus for successful lending
            };
        };

        if (is_successful) {
            registry.total_volume = registry.total_volume + amount;
        };
    }

    /// Get user reputation
    public fun get_user_reputation(user_address: address): (u64, u64, u64, u64, u64, u64, u64, u64, u64, u64) acquires GlobalRegistry {
        let registry = borrow_global<GlobalRegistry>(@aura_lend);
        
        if (simple_map::contains_key(&registry.user_reputations, &user_address)) {
            let rep = simple_map::borrow(&registry.user_reputations, &user_address);
            (
                rep.total_borrowed,
                rep.total_lent,
                rep.total_repaid,
                rep.loans_taken,
                rep.loans_given,
                rep.successful_repayments,
                rep.defaulted_loans,
                rep.reputation_score,
                rep.joined_at,
                rep.last_activity,
            )
        } else {
            (0, 0, 0, 0, 0, 0, 0, 100, 0, 0) // Default values
        }
    }

    /// Get platform statistics
    public fun get_platform_stats(): (u64, u64) acquires GlobalRegistry {
        let registry = borrow_global<GlobalRegistry>(@aura_lend);
        (registry.total_users, registry.total_volume)
    }

    /// Check if user exists in registry
    public fun user_exists(user_address: address): bool acquires GlobalRegistry {
        let registry = borrow_global<GlobalRegistry>(@aura_lend);
        simple_map::contains_key(&registry.user_reputations, &user_address)
    }

    /// Get reputation score only
    public fun get_reputation_score(user_address: address): u64 acquires GlobalRegistry {
        let (_, _, _, _, _, _, _, score, _, _) = get_user_reputation(user_address);
        score
    }
}
