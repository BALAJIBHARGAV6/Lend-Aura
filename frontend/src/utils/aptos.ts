import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';

// Configuration
const NETWORK = Network.DEVNET; // Changed to DEVNET where contracts are deployed
const MODULE_ADDRESS = "0x593c05afb0b61418fd5c87aa150f57ed70eb4761fe555645f4822cb374ddae0f"; // Deployed contract address

// Initialize Aptos client
function getFullnodeUrl(network: Network): string {
  if (network === Network.MAINNET) {
    return 'https://fullnode.mainnet.aptoslabs.com/v1';
  } else if (network === Network.TESTNET) {
    return 'https://fullnode.testnet.aptoslabs.com/v1';
  } else {
    return 'https://fullnode.devnet.aptoslabs.com/v1';
  }
}

export const aptosConfig = new AptosConfig({ 
  network: NETWORK,
  fullnode: getFullnodeUrl(NETWORK),
});

export const aptos = new Aptos(aptosConfig);

// Contract addresses and module names
export const CONTRACT_ADDRESS = MODULE_ADDRESS;
export const MODULES = {
  PROPERTY_NFT: `${CONTRACT_ADDRESS}::property_nft`,
  LOAN_VAULT: `${CONTRACT_ADDRESS}::loan_vault`,
  AUCTION_HOUSE: `${CONTRACT_ADDRESS}::auction_house`,
  REGISTRY: `${CONTRACT_ADDRESS}::registry`,
  EVENTS: `${CONTRACT_ADDRESS}::events`,
} as const;

// Type definitions for contract data structures
export interface PropertyNFT {
  property_id: number;
  owner: string;
  valuation_hash: string;
  is_attested: boolean;
  attestor: string;
  created_at: number;
  attested_at: number;
  metadata_uri: string;
}

export interface LoanRequest {
  loan_id: number;
  borrower: string;
  nft_id: number;
  nft_owner: string;
  amount: number;
  interest_rate_bps: number;
  duration_secs: number;
  created_at: number;
  status: number;
}

export interface ActiveLoan {
  loan_id: number;
  borrower: string;
  lender: string;
  nft_id: number;
  nft_owner: string;
  principal: number;
  interest_rate_bps: number;
  funded_at: number;
  due_date: number;
  repayment_amount: number;
  status: number;
}

export interface Auction {
  auction_id: number;
  nft_id: number;
  original_borrower: string;
  lender: string;
  loan_id: number;
  start_time: number;
  end_time: number;
  min_bid: number;
  current_highest_bid: number;
  highest_bidder: string;
  total_bids: number;
  status: number;
}

export interface BorrowerProfile {
  total_loans_taken: number;
  loans_repaid: number;
  loans_defaulted: number;
  total_amount_borrowed: number;
  total_amount_repaid: number;
  repayment_score: number;
  is_blacklisted: boolean;
  first_loan_timestamp: number;
  last_activity_timestamp: number;
}

export interface Bid {
  bidder: string;
  amount: number;
  timestamp: number;
}

// Status enums
export const LOAN_STATUS = {
  REQUESTED: 0,
  FUNDED: 1,
  REPAID: 2,
  DEFAULTED: 3,
} as const;

export const AUCTION_STATUS = {
  ACTIVE: 0,
  ENDED: 1,
  SETTLED: 2,
} as const;

// Helper functions for contract interactions
export class AuraLendClient {
  private aptos: Aptos;

  constructor(aptosClient: Aptos = aptos) {
    this.aptos = aptosClient;
  }

  // Property NFT functions
  async mintPropertyNFT(
    account: any,
    valuationHash: string,
    metadataUri: string
  ): Promise<string> {
    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULES.PROPERTY_NFT}::mint_property_nft`,
        functionArguments: [
          Array.from(new TextEncoder().encode(valuationHash)),
          metadataUri,
        ],
      },
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return response.hash;
  }

  async getPropertyNFT(propertyId: number, owner: string): Promise<PropertyNFT | null> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.PROPERTY_NFT}::get_property_nft`,
          functionArguments: [propertyId, owner],
        },
      });

      const [
        property_id,
        owner_addr,
        valuation_hash,
        is_attested,
        attestor,
        created_at,
        attested_at,
        metadata_uri,
      ] = result as [number, string, string, boolean, string, number, number, string];

      return {
        property_id,
        owner: owner_addr,
        valuation_hash: new TextDecoder().decode(new Uint8Array(valuation_hash as any)),
        is_attested,
        attestor,
        created_at,
        attested_at,
        metadata_uri,
      };
    } catch (error) {
      console.error('Error fetching property NFT:', error);
      return null;
    }
  }

  async getUserProperties(owner: string): Promise<number[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.PROPERTY_NFT}::get_user_properties`,
          functionArguments: [owner],
        },
      });

      return result[0] as number[];
    } catch (error) {
      console.error('Error fetching user properties:', error);
      return [];
    }
  }

  // Loan Vault functions
  async createLoanRequest(
    account: any,
    nftId: number,
    nftOwner: string,
    amount: number,
    interestRateBps: number,
    durationSecs: number
  ): Promise<string> {
    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULES.LOAN_VAULT}::create_loan_request`,
        functionArguments: [
          nftId,
          nftOwner,
          amount,
          interestRateBps,
          durationSecs,
        ],
      },
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return response.hash;
  }

  async fundLoan(
    account: any,
    loanId: number,
    borrowerAddress: string
  ): Promise<string> {
    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULES.LOAN_VAULT}::fund_loan`,
        functionArguments: [loanId, borrowerAddress],
      },
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return response.hash;
  }

  async repayLoan(
    account: any,
    loanId: number,
    lenderAddress: string
  ): Promise<string> {
    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULES.LOAN_VAULT}::repay_loan`,
        functionArguments: [loanId, lenderAddress],
      },
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return response.hash;
  }

  async getActiveLoanRequests(): Promise<number[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.LOAN_VAULT}::get_active_loan_requests`,
          functionArguments: [],
        },
      });

      return result[0] as number[];
    } catch (error) {
      console.error('Error fetching active loan requests:', error);
      return [];
    }
  }

  async getActiveLoans(): Promise<number[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.LOAN_VAULT}::get_active_loans`,
          functionArguments: [],
        },
      });

      return result[0] as number[];
    } catch (error) {
      console.error('Error fetching active loans:', error);
      return [];
    }
  }

  async getLoanRequest(loanId: number, borrower: string): Promise<LoanRequest | null> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.LOAN_VAULT}::get_loan_request`,
          functionArguments: [loanId, borrower],
        },
      });

      const [
        loan_id,
        borrower_addr,
        nft_id,
        nft_owner,
        amount,
        interest_rate_bps,
        duration_secs,
        created_at,
        status,
      ] = result as [number, string, number, string, number, number, number, number, number];

      return {
        loan_id,
        borrower: borrower_addr,
        nft_id,
        nft_owner,
        amount,
        interest_rate_bps,
        duration_secs,
        created_at,
        status,
      };
    } catch (error) {
      console.error('Error fetching loan request:', error);
      return null;
    }
  }

  // Auction House functions
  async getActiveAuctions(): Promise<number[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.AUCTION_HOUSE}::get_active_auctions`,
          functionArguments: [],
        },
      });

      return result[0] as number[];
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      return [];
    }
  }

  async getAuction(auctionId: number, lender: string): Promise<Auction | null> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.AUCTION_HOUSE}::get_auction`,
          functionArguments: [auctionId, lender],
        },
      });

      const [
        auction_id,
        nft_id,
        original_borrower,
        lender_addr,
        loan_id,
        start_time,
        end_time,
        min_bid,
        current_highest_bid,
        highest_bidder,
        total_bids,
        status,
      ] = result as [number, number, string, string, number, number, number, number, number, string, number, number];

      return {
        auction_id,
        nft_id,
        original_borrower,
        lender: lender_addr,
        loan_id,
        start_time,
        end_time,
        min_bid,
        current_highest_bid,
        highest_bidder,
        total_bids,
        status,
      };
    } catch (error) {
      console.error('Error fetching auction:', error);
      return null;
    }
  }

  async placeBid(
    account: any,
    auctionId: number,
    lenderAddress: string,
    bidAmount: number
  ): Promise<string> {
    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULES.AUCTION_HOUSE}::place_bid`,
        functionArguments: [auctionId, lenderAddress, bidAmount],
      },
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return response.hash;
  }

  // Registry functions
  async getBorrowerProfile(borrower: string): Promise<BorrowerProfile | null> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.REGISTRY}::get_borrower_profile`,
          functionArguments: [borrower],
        },
      });

      const [
        total_loans_taken,
        loans_repaid,
        loans_defaulted,
        total_amount_borrowed,
        total_amount_repaid,
        repayment_score,
        is_blacklisted,
        first_loan_timestamp,
        last_activity_timestamp,
      ] = result as [number, number, number, number, number, number, boolean, number, number];

      return {
        total_loans_taken,
        loans_repaid,
        loans_defaulted,
        total_amount_borrowed,
        total_amount_repaid,
        repayment_score,
        is_blacklisted,
        first_loan_timestamp,
        last_activity_timestamp,
      };
    } catch (error) {
      console.error('Error fetching borrower profile:', error);
      return null;
    }
  }

  // Utility functions
  formatAPT(amount: number): string {
    return (amount / 100_000_000).toFixed(4);
  }

  parseAPT(amount: string): number {
    return Math.round(parseFloat(amount) * 100_000_000);
  }

  formatInterestRate(bps: number): string {
    return (bps / 100).toFixed(2) + '%';
  }

  formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  }

  calculateRepaymentAmount(principal: number, interestRateBps: number): number {
    return principal + (principal * interestRateBps) / 10000;
  }

  isLoanOverdue(dueDate: number): boolean {
    return Date.now() / 1000 > dueDate;
  }

  getTimeUntilDue(dueDate: number): string {
    const now = Date.now() / 1000;
    const timeLeft = dueDate - now;
    
    if (timeLeft <= 0) {
      return 'Overdue';
    }
    
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Get APT balance for an account
  async getAccountAPTBalance(accountAddress: string): Promise<number> {
    try {
      const resources = await this.aptos.getAccountResources({ accountAddress });
      const coinResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (coinResource) {
        const balance = (coinResource.data as any).coin.value;
        return parseInt(balance);
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to fetch APT balance:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const auraLendClient = new AuraLendClient();
