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
    try {
      console.log('Starting mintPropertyNFT with params:', {
        account: typeof account === 'string' ? account : account?.accountAddress || account?.address,
        valuationHash,
        metadataUri
      });

      // Check if Petra wallet is available
      const petra = (window as any).aptos;
      if (!petra) {
        throw new Error('Petra wallet not found. Please install Petra wallet extension.');
      }

      // Try to connect if not connected
      let walletAccount;
      try {
        walletAccount = await petra.account();
      } catch (error) {
        console.log('Wallet not connected, attempting to connect...');
        try {
          await petra.connect();
          walletAccount = await petra.account();
        } catch (connectError) {
          throw new Error('Failed to connect to Petra wallet. Please connect manually and try again.');
        }
      }

      if (!walletAccount?.address) {
        throw new Error('Could not get wallet account. Please reconnect your Petra wallet.');
      }

      console.log('Connected wallet address:', walletAccount.address);
      
      if (!valuationHash || !metadataUri) {
        throw new Error('Valuation hash and metadata URI are required');
      }

      // Ensure IPFS hash format is correct - should not include 'ipfs://' prefix for valuation hash
      const cleanValuationHash = valuationHash.replace('ipfs://', '');
      
      // Ensure metadata URI has proper format
      const properMetadataUri = metadataUri.startsWith('ipfs://') ? metadataUri : `ipfs://${metadataUri}`;

      console.log('Processed parameters:', {
        cleanValuationHash,
        properMetadataUri,
        contractFunction: `${MODULES.PROPERTY_NFT}::mint_property_nft`
      });

      // Build transaction payload using correct format
      const payload = {
        type: "entry_function_payload",
        function: `${MODULES.PROPERTY_NFT}::mint_property_nft`,
        type_arguments: [],
        arguments: [
          cleanValuationHash,  // Send as string directly
          properMetadataUri,   // Send as proper IPFS URI
        ],
      };

      console.log('Final transaction payload:', JSON.stringify(payload, null, 2));

      // Submit transaction using Petra wallet with new format
      console.log('Submitting transaction...');
      
      const pendingTransaction = await Promise.race([
        petra.signAndSubmitTransaction({ payload }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout after 30 seconds')), 30000)
        )
      ]);
      
      console.log('Transaction submitted:', pendingTransaction);

      // Wait for transaction to be processed
      if (pendingTransaction && pendingTransaction.hash) {
        console.log('Transaction hash:', pendingTransaction.hash);
        
        // Wait for confirmation
        console.log('Waiting for transaction confirmation...');
        
        try {
          // Try to wait for the transaction on chain
          await this.aptos.waitForTransaction({ transactionHash: pendingTransaction.hash });
          console.log('✅ Transaction confirmed on blockchain!');
        } catch (waitError) {
          console.log('Could not wait for transaction confirmation, but transaction was submitted');
        }
        
        return pendingTransaction.hash;
      } else {
        throw new Error('Transaction failed - no hash returned');
      }

    } catch (error) {
      console.error('Error in mintPropertyNFT:', error);
      
      // Enhanced error logging
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      if (error?.code) {
        console.error('Error code:', error.code);
      }
      if (error?.data) {
        console.error('Error data:', error.data);
      }
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      
      // Re-throw with more user-friendly message
      if (error?.message?.includes('FUNCTION_NOT_FOUND')) {
        throw new Error('Smart contract function not found. The contract may not be properly deployed.');
      } else if (error?.message?.includes('INSUFFICIENT_BALANCE')) {
        throw new Error('Insufficient APT balance for transaction fees.');
      } else if (error?.message?.includes('USER_CANCEL')) {
        throw new Error('Transaction cancelled by user.');
      } else {
        throw new Error(error?.message || 'Transaction failed. Please try again.');
      }
    }
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
      console.warn('getActiveLoanRequests temporarily disabled - contract function not found');
      return []; // Return empty array temporarily
      
      // Uncomment when contract is updated
      /*
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.LOAN_VAULT}::get_active_loan_requests`,
          functionArguments: [],
        },
      });

      return result[0] as number[];
      */
    } catch (error) {
      console.error('Error fetching active loan requests:', error);
      return [];
    }
  }

  async getActiveLoans(): Promise<number[]> {
    try {
      console.warn('getActiveLoans temporarily disabled - contract function not found');
      return []; // Return empty array temporarily
      
      // Uncomment when contract is updated
      /*
      const result = await this.aptos.view({
        payload: {
          function: `${MODULES.LOAN_VAULT}::get_active_loans`,
          functionArguments: [],
        },
      });

      return result[0] as number[];
      */
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

  // Metadata generation helper
  generatePropertyMetadata(options: {
    propertyName?: string;
    description?: string;
    propertyType?: string;
    location?: string;
    bedrooms?: string;
    bathrooms?: string;
    squareFeet?: string;
    yearBuilt?: string;
    imageUrl?: string;
    externalUrl?: string;
  } = {}): string {
    const {
      propertyName = "Luxury Property NFT",
      description = "High-value residential property for DeFi collateral",
      propertyType = "Residential",
      location = "Premium District",
      bedrooms = "3",
      bathrooms = "2",
      squareFeet = "1500",
      yearBuilt = "2020",
      imageUrl = "ipfs://QmPropertyImageHash...",
      externalUrl = "https://property-details.com"
    } = options;

    const metadata = {
      "name": propertyName,
      "description": description,
      "image": imageUrl,
      "external_url": externalUrl,
      "attributes": [
        {
          "trait_type": "Property Type",
          "value": propertyType
        },
        {
          "trait_type": "Location",
          "value": location
        },
        {
          "trait_type": "Bedrooms",
          "value": bedrooms
        },
        {
          "trait_type": "Bathrooms",
          "value": bathrooms
        },
        {
          "trait_type": "Square Feet",
          "value": squareFeet
        },
        {
          "trait_type": "Year Built",
          "value": yearBuilt
        }
      ]
    };

    return JSON.stringify(metadata, null, 2);
  }

  // Quick metadata generator with default values
  generateQuickMetadata(): string {
    return this.generatePropertyMetadata();
  }

  // Test function to verify wallet connection
  async testWalletConnection(): Promise<any> {
    try {
      const petra = (window as any).aptos;
      if (!petra) {
        return { error: 'Petra wallet not found. Please install the Petra wallet extension.' };
      }

      // Try to get account info
      let account;
      let isConnected = false;
      
      try {
        account = await petra.account();
        isConnected = !!account?.address;
      } catch (error) {
        console.log('Initial account check failed, trying to connect...');
        
        try {
          await petra.connect();
          account = await petra.account();
          isConnected = !!account?.address;
        } catch (connectError) {
          return { 
            error: 'Failed to connect to Petra wallet. Please connect manually through the extension.',
            details: connectError?.message 
          };
        }
      }
      
      if (!isConnected || !account?.address) {
        return { error: 'Could not establish wallet connection. Please reconnect Petra wallet.' };
      }

      const network = await petra.network();

      console.log('Wallet details:', { account, network });

      return {
        success: true,
        isConnected: true,
        account: account.address,
        network: network?.name || 'unknown',
        publicKey: account?.publicKey?.slice(0, 10) + '...' // Truncate for security
      };
    } catch (error) {
      console.error('Wallet connection test failed:', error);
      return { 
        error: error?.message || 'Unknown wallet error',
        type: 'connection_error'
      };
    }
  }

  // Test mint function with detailed logging
  async testMintNFT(valuationHash?: string, metadataUri?: string): Promise<any> {
    try {
      const defaultValuationHash = valuationHash || "bafkreig6f2ypsanqGpyintumlljzudw3f";
      const defaultMetadataUri = metadataUri || "ipfs://QmbafkrEig6f2ypsanqGpyintumlljzudw3f";

      console.log('🧪 Starting test mint with:', {
        valuationHash: defaultValuationHash,
        metadataUri: defaultMetadataUri
      });

      // First test wallet connection
      const walletTest = await this.testWalletConnection();
      console.log('🔌 Wallet test result:', walletTest);
      
      if (!walletTest.success) {
        return walletTest;
      }

      console.log('✅ Wallet connected, proceeding with mint test...');

      // Call the mint function with proper error handling
      const result = await this.mintPropertyNFT(walletTest.account, defaultValuationHash, defaultMetadataUri);
      
      console.log('🎉 Mint test successful:', result);
      return { 
        success: true, 
        result, 
        transactionHash: result,
        message: 'NFT minted successfully!'
      };
      
    } catch (error) {
      console.error('❌ Test mint failed:', error);
      return { 
        error: error?.message || error,
        details: {
          message: error?.message,
          code: error?.code,
          data: error?.data,
          type: error?.constructor?.name
        }
      };
    }
  }
}

// Export singleton instance
export const auraLendClient = new AuraLendClient();