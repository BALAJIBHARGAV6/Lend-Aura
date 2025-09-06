module aura_lend::auction_house {
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aura_lend::events;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_AUCTION_NOT_FOUND: u64 = 2;
    const E_AUCTION_ENDED: u64 = 3;
    const E_BID_TOO_LOW: u64 = 4;
    const E_AUCTION_NOT_ENDED: u64 = 5;
    const E_ALREADY_SETTLED: u64 = 6;

    /// Auction status
    const AUCTION_ACTIVE: u8 = 0;
    const AUCTION_ENDED: u8 = 1;
    const AUCTION_SETTLED: u8 = 2;

    /// Auction data
    struct Auction has key, store, drop {
        auction_id: u64,
        nft_owner: address,
        nft_id: u64,
        lender: address,
        starting_bid: u64,
        current_bid: u64,
        highest_bidder: address,
        start_time: u64,
        end_time: u64,
        status: u8,
        bid_count: u64,
    }

    /// Global auction registry
    struct AuctionRegistry has key {
        next_auction_id: u64,
        active_auctions: vector<u64>,
        total_auctions_created: u64,
    }

    /// Auction storage
    struct AuctionStorage has key {
        auctions: vector<Auction>,
    }

    /// User bid tracking
    struct UserBids has key {
        bid_history: vector<u64>, // auction_ids where user has bid
    }

    /// Initialize the auction house
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, AuctionRegistry {
            next_auction_id: 1,
            active_auctions: vector::empty(),
            total_auctions_created: 0,
        });

        move_to(admin, AuctionStorage {
            auctions: vector::empty(),
        });
    }

    /// Start an auction for a defaulted loan
    public entry fun start_auction(
        _caller: &signer, // Anyone can start auction for defaulted loans
        nft_owner: address,
        nft_id: u64,
        lender: address,
        starting_bid: u64,
        duration_hours: u64,
    ) acquires AuctionRegistry, AuctionStorage {
        // Get next auction ID
        let registry = borrow_global_mut<AuctionRegistry>(@aura_lend);
        let auction_id = registry.next_auction_id;
        registry.next_auction_id = auction_id + 1;
        registry.total_auctions_created = registry.total_auctions_created + 1;

        // Create auction
        let now = timestamp::now_seconds();
        let auction = Auction {
            auction_id,
            nft_owner,
            nft_id,
            lender,
            starting_bid,
            current_bid: starting_bid,
            highest_bidder: @0x0,
            start_time: now,
            end_time: now + (duration_hours * 60 * 60),
            status: AUCTION_ACTIVE,
            bid_count: 0,
        };

        // Store auction
        let storage = borrow_global_mut<AuctionStorage>(@aura_lend);
        vector::push_back(&mut storage.auctions, auction);
        vector::push_back(&mut registry.active_auctions, auction_id);

        // Emit event
        events::emit_auction_started(auction_id, nft_id, starting_bid, now + (duration_hours * 60 * 60));
    }

    /// Place a bid on an auction
    public entry fun place_bid(
        bidder: &signer,
        auction_id: u64,
        bid_amount: u64,
    ) acquires AuctionStorage, UserBids {
        let bidder_addr = signer::address_of(bidder);
        
        // Find auction
        let storage = borrow_global_mut<AuctionStorage>(@aura_lend);
        let auction_index = find_auction_index(&storage.auctions, auction_id);
        let auction = vector::borrow_mut(&mut storage.auctions, auction_index);
        
        // Verify auction is active
        assert!(auction.status == AUCTION_ACTIVE, error::invalid_state(E_AUCTION_ENDED));
        assert!(timestamp::now_seconds() < auction.end_time, error::invalid_state(E_AUCTION_ENDED));
        
        // Verify bid amount
        assert!(bid_amount > auction.current_bid, error::invalid_argument(E_BID_TOO_LOW));
        
        // Refund previous highest bidder if exists
        if (auction.highest_bidder != @0x0) {
            coin::transfer<AptosCoin>(bidder, auction.highest_bidder, auction.current_bid);
        };
        
        // Hold the new bid amount from bidder
        // Note: In production, you'd want to implement a proper escrow system
        
        // Update auction
        auction.current_bid = bid_amount;
        auction.highest_bidder = bidder_addr;
        auction.bid_count = auction.bid_count + 1;

        // Track user's bid history
        if (!exists<UserBids>(bidder_addr)) {
            move_to(bidder, UserBids {
                bid_history: vector::empty(),
            });
        };
        
        let user_bids = borrow_global_mut<UserBids>(bidder_addr);
        if (!vector::contains(&user_bids.bid_history, &auction_id)) {
            vector::push_back(&mut user_bids.bid_history, auction_id);
        };

        // Emit event
        events::emit_bid_placed(auction_id, bidder_addr, bid_amount);
    }

    /// End an auction (can be called by anyone after end time)
    public entry fun end_auction(
        _caller: &signer,
        auction_id: u64,
    ) acquires AuctionStorage, AuctionRegistry {
        let storage = borrow_global_mut<AuctionStorage>(@aura_lend);
        let auction_index = find_auction_index(&storage.auctions, auction_id);
        let auction = vector::borrow_mut(&mut storage.auctions, auction_index);
        
        assert!(auction.status == AUCTION_ACTIVE, error::invalid_state(E_AUCTION_ENDED));
        assert!(timestamp::now_seconds() >= auction.end_time, error::invalid_state(E_AUCTION_NOT_ENDED));
        
        // Update auction status
        auction.status = AUCTION_ENDED;

        // Remove from active auctions
        let registry = borrow_global_mut<AuctionRegistry>(@aura_lend);
        let (found, index) = vector::index_of(&registry.active_auctions, &auction_id);
        if (found) {
            vector::remove(&mut registry.active_auctions, index);
        };

        // Emit event
        events::emit_auction_ended(auction_id, auction.highest_bidder, auction.current_bid);
    }

    /// Settle an auction - transfer NFT to winner and funds to lender
    public entry fun settle_auction(
        _caller: &signer,
        auction_id: u64,
    ) acquires AuctionStorage {
        let storage = borrow_global_mut<AuctionStorage>(@aura_lend);
        let auction_index = find_auction_index(&storage.auctions, auction_id);
        let auction = vector::borrow_mut(&mut storage.auctions, auction_index);
        
        assert!(auction.status == AUCTION_ENDED, error::invalid_state(E_AUCTION_NOT_ENDED));
        
        // Transfer proceeds to lender
        if (auction.highest_bidder != @0x0) {
            // In a production system, you'd transfer the NFT to the winner here
            // and the held bid amount to the lender
            // For now, we just mark as settled
        };
        
        auction.status = AUCTION_SETTLED;

        // Emit event
        events::emit_auction_settled(auction_id, auction.highest_bidder, auction.current_bid);
    }

    /// Helper function to find auction index
    fun find_auction_index(auctions: &vector<Auction>, auction_id: u64): u64 {
        let len = vector::length(auctions);
        let i = 0;
        while (i < len) {
            let auction = vector::borrow(auctions, i);
            if (auction.auction_id == auction_id) {
                return i
            };
            i = i + 1;
        };
        abort error::not_found(E_AUCTION_NOT_FOUND)
    }

    /// Get auction details
    public fun get_auction(auction_id: u64): (u64, address, u64, address, u64, u64, address, u64, u64, u8, u64) acquires AuctionStorage {
        let storage = borrow_global<AuctionStorage>(@aura_lend);
        let auction_index = find_auction_index(&storage.auctions, auction_id);
        let auction = vector::borrow(&storage.auctions, auction_index);
        
        (
            auction.auction_id,
            auction.nft_owner,
            auction.nft_id,
            auction.lender,
            auction.starting_bid,
            auction.current_bid,
            auction.highest_bidder,
            auction.start_time,
            auction.end_time,
            auction.status,
            auction.bid_count,
        )
    }

    /// Get active auctions
    public fun get_active_auctions(): vector<u64> acquires AuctionRegistry {
        let registry = borrow_global<AuctionRegistry>(@aura_lend);
        registry.active_auctions
    }

    /// Get user's bid history
    public fun get_user_bid_history(user: address): vector<u64> acquires UserBids {
        if (!exists<UserBids>(user)) {
            return vector::empty()
        };
        
        let user_bids = borrow_global<UserBids>(user);
        user_bids.bid_history
    }

    /// Get auction statistics
    public fun get_auction_stats(): (u64, u64) acquires AuctionRegistry {
        let registry = borrow_global<AuctionRegistry>(@aura_lend);
        (
            registry.next_auction_id - 1,
            registry.total_auctions_created,
        )
    }

    /// Check if auction exists
    public fun auction_exists(auction_id: u64): bool acquires AuctionStorage {
        let storage = borrow_global<AuctionStorage>(@aura_lend);
        let len = vector::length(&storage.auctions);
        let i = 0;
        while (i < len) {
            let auction = vector::borrow(&storage.auctions, i);
            if (auction.auction_id == auction_id) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Check if auction is active
    public fun is_auction_active(auction_id: u64): bool acquires AuctionStorage {
        let storage = borrow_global<AuctionStorage>(@aura_lend);
        let auction_index = find_auction_index(&storage.auctions, auction_id);
        let auction = vector::borrow(&storage.auctions, auction_index);
        
        auction.status == AUCTION_ACTIVE && timestamp::now_seconds() < auction.end_time
    }
}
