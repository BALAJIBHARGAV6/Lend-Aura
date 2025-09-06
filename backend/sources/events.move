module aura_lend::events {
    use std::string::String;
    use aptos_framework::event;

    #[event]
    /// Emitted when a property NFT is minted
    struct PropertyNFTMinted has drop, store {
        property_id: u64,
        owner: address,
        valuation_hash: vector<u8>,
        timestamp: u64,
    }

    #[event]
    /// Emitted when a property NFT is attested by an authorized attestor
    struct PropertyNFTAttested has drop, store {
        property_id: u64,
        attestor: address,
        timestamp: u64,
    }

    #[event]
    /// Emitted when a new loan request is created
    struct LoanOpened has drop, store {
        loan_id: u64,
        borrower: address,
        nft_id: u64,
        amount: u64,
        interest_rate_bps: u64,
        duration_secs: u64,
        timestamp: u64,
    }

    #[event]
    /// Emitted when a loan is funded by a lender
    struct LoanFunded has drop, store {
        loan_id: u64,
        lender: address,
        borrower: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    /// Emitted when a loan is successfully repaid
    struct LoanRepaid has drop, store {
        loan_id: u64,
        borrower: address,
        lender: address,
        repayment_amount: u64,
        timestamp: u64,
    }

    #[event]
    /// Emitted when a loan defaults
    struct DefaultTriggered has drop, store {
        loan_id: u64,
        borrower: address,
        lender: address,
        nft_id: u64,
        timestamp: u64,
    }

    #[event]
    /// Emitted when an auction for defaulted collateral starts
    struct AuctionStarted has drop, store {
        auction_id: u64,
        nft_id: u64,
        lender: address,
        loan_id: u64,
        start_time: u64,
        end_time: u64,
    }

    #[event]
    /// Emitted when a bid is placed on an auction
    struct BidPlaced has drop, store {
        auction_id: u64,
        bidder: address,
        bid_amount: u64,
        timestamp: u64,
    }

    #[event]
    /// Emitted when an auction is settled
    struct AuctionSettled has drop, store {
        auction_id: u64,
        winner: address,
        winning_bid: u64,
        nft_id: u64,
        timestamp: u64,
    }

    // Event emission functions
    public fun emit_property_nft_minted(
        property_id: u64,
        owner: address,
        valuation_hash: vector<u8>,
        timestamp: u64,
    ) {
        event::emit(PropertyNFTMinted {
            property_id,
            owner,
            valuation_hash,
            timestamp,
        });
    }

    public fun emit_property_nft_attested(
        property_id: u64,
        attestor: address,
        timestamp: u64,
    ) {
        event::emit(PropertyNFTAttested {
            property_id,
            attestor,
            timestamp,
        });
    }

    public fun emit_loan_opened(
        loan_id: u64,
        borrower: address,
        nft_id: u64,
        amount: u64,
        interest_rate_bps: u64,
        duration_secs: u64,
        timestamp: u64,
    ) {
        event::emit(LoanOpened {
            loan_id,
            borrower,
            nft_id,
            amount,
            interest_rate_bps,
            duration_secs,
            timestamp,
        });
    }

    public fun emit_loan_funded(
        loan_id: u64,
        lender: address,
        borrower: address,
        amount: u64,
        timestamp: u64,
    ) {
        event::emit(LoanFunded {
            loan_id,
            lender,
            borrower,
            amount,
            timestamp,
        });
    }

    public fun emit_loan_repaid(
        loan_id: u64,
        borrower: address,
        lender: address,
        repayment_amount: u64,
        timestamp: u64,
    ) {
        event::emit(LoanRepaid {
            loan_id,
            borrower,
            lender,
            repayment_amount,
            timestamp,
        });
    }

    public fun emit_default_triggered(
        loan_id: u64,
        borrower: address,
        lender: address,
        nft_id: u64,
        timestamp: u64,
    ) {
        event::emit(DefaultTriggered {
            loan_id,
            borrower,
            lender,
            nft_id,
            timestamp,
        });
    }

    public fun emit_auction_started(
        auction_id: u64,
        nft_id: u64,
        lender: address,
        loan_id: u64,
        start_time: u64,
        end_time: u64,
    ) {
        event::emit(AuctionStarted {
            auction_id,
            nft_id,
            lender,
            loan_id,
            start_time,
            end_time,
        });
    }

    public fun emit_bid_placed(
        auction_id: u64,
        bidder: address,
        bid_amount: u64,
        timestamp: u64,
    ) {
        event::emit(BidPlaced {
            auction_id,
            bidder,
            bid_amount,
            timestamp,
        });
    }

    public fun emit_auction_settled(
        auction_id: u64,
        winner: address,
        winning_bid: u64,
        nft_id: u64,
        timestamp: u64,
    ) {
        event::emit(AuctionSettled {
            auction_id,
            winner,
            winning_bid,
            nft_id,
            timestamp,
        });
    }
}
