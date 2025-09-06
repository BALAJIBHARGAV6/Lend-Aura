import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auraLendClient, type LoanRequest, type Auction, type ActiveLoan } from '@/utils/aptos';

export function useLoansData() {
  // Get all active loan requests
  const {
    data: activeLoanRequests,
    isLoading: loanRequestsLoading,
    error: loanRequestsError,
  } = useQuery({
    queryKey: ['activeLoanRequests'],
    queryFn: async () => {
      const loanIds = await auraLendClient.getActiveLoanRequests();
      
      // Fetch details for each loan request
      const requests = await Promise.allSettled(
        loanIds.map(async (loanId) => {
          // We need to find the borrower address - this is a limitation of the current design
          // In a real implementation, we might want to emit events or maintain an index
          try {
            // For now, we'll return just the ID and fetch details when needed
            return { loanId, needsDetails: true };
          } catch (error) {
            console.error(`Failed to fetch loan request ${loanId}:`, error);
            return null;
          }
        })
      );

      return requests
        .filter((result): result is PromiseFulfilledResult<{ loanId: number; needsDetails: boolean }> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get all active loans
  const {
    data: activeLoans,
    isLoading: activeLoansLoading,
    error: activeLoansError,
  } = useQuery({
    queryKey: ['activeLoans'],
    queryFn: async () => {
      const loanIds = await auraLendClient.getActiveLoans();
      
      // Similar limitation as above - we need lender addresses
      return loanIds.map(loanId => ({ loanId, needsDetails: true }));
    },
    refetchInterval: 30000,
  });

  return {
    activeLoanRequests,
    activeLoans,
    loanRequestsLoading,
    activeLoansLoading,
    loanRequestsError,
    activeLoansError,
  };
}

// Export hook for Explorer page
export function useExplorerData(searchQuery: string, filterType: string) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['explorerSearch', searchQuery, filterType],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      // Add to search history
      if (searchQuery.length >= 3) {
        setSearchHistory((prev: string[]) => {
          const updated = [searchQuery, ...prev.filter((item: string) => item !== searchQuery)];
          return updated.slice(0, 10); // Keep only last 10 searches
        });
      }

      // Mock search results - in real app, this would query the blockchain
      const mockResults = [
        {
          type: 'nft' as const,
          id: 'nft-001',
          title: 'Property NFT #001 - Manhattan Apartment',
          description: 'Luxury 2BR/2BA apartment in downtown Manhattan with verified valuation',
          metadata: {
            value: '75 APT',
            owner: '0x1234...5678',
            status: 'Collateralized'
          },
          timestamp: Date.now() / 1000 - 86400,
        },
        {
          type: 'loan' as const,
          id: 'loan-001',
          title: 'Loan Request #001',
          description: 'Active loan secured by Property NFT #001',
          metadata: {
            amount: '50 APT',
            rate: '12% APR',
            duration: '30 days',
            status: 'Funded'
          },
          timestamp: Date.now() / 1000 - 3600,
        },
        {
          type: 'auction' as const,
          id: 'auction-001',
          title: 'Auction #001 - Defaulted Collateral',
          description: 'Property NFT #123 being auctioned due to loan default',
          metadata: {
            highestBid: '42 APT',
            bidders: '7',
            timeLeft: '2h 15m',
            status: 'Active'
          },
          timestamp: Date.now() / 1000 - 1800,
        },
        {
          type: 'address' as const,
          id: 'addr-001',
          title: '0x1234...5678',
          description: 'Active borrower with good reputation score',
          metadata: {
            loansRepaid: '15',
            reputation: '850/1000',
            totalBorrowed: '450 APT',
            status: 'Good Standing'
          },
          timestamp: Date.now() / 1000 - 7200,
        }
      ];

      // Filter results based on search query
      const filtered = mockResults.filter(result => {
        const query = searchQuery.toLowerCase();
        return (
          result.title.toLowerCase().includes(query) ||
          result.description.toLowerCase().includes(query) ||
          result.id.toLowerCase().includes(query) ||
          Object.values(result.metadata).some(value => 
            String(value).toLowerCase().includes(query)
          )
        );
      });

      return filtered;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });

  return {
    searchResults: searchResults || [],
    isSearching: isSearching && searchQuery.length >= 2,
    searchHistory,
  };
}

// Export hooks for Profile page
export function useUserProfile(address: string) {
  return useQuery({
    queryKey: ['userProfile', address],
    queryFn: async () => {
      if (!address) return null;
      
      try {
        // Get user profile from registry using the client method
        const profile = await auraLendClient.getBorrowerProfile(address);
        
        if (!profile) return null;

        return {
          address,
          totalLoans: profile.total_loans_taken,
          successfulRepayments: profile.loans_repaid,
          defaults: profile.loans_defaulted,
          totalBorrowed: profile.total_amount_borrowed,
          totalRepaid: profile.total_amount_repaid,
          reputationScore: profile.repayment_score,
          isActive: !profile.is_blacklisted,
          // Add missing properties for ProfilePage
          username: `User-${address.slice(2, 8)}`,
          reputation: profile.repayment_score,
          joinDate: profile.first_loan_timestamp ? profile.first_loan_timestamp * 1000 : Date.now(),
          totalPortfolioValue: profile.total_amount_borrowed - profile.total_amount_repaid,
          recentActivity: [],
          allActivity: [],
        };
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
      }
    },
    enabled: !!address,
    staleTime: 30000,
  });
}

export function useUserLoans(address: string) {
  return useQuery({
    queryKey: ['userLoans', address],
    queryFn: async () => {
      if (!address) return [];
      
      try {
        // Get user's loan history from events or maintain an index
        // For now, returning placeholder data with required structure
        const loans = [
          {
            loanId: 1,
            amount: 50,
            interestRate: 10,
            duration: 30,
            status: 'active',
            nftId: 1,
            createdAt: Date.now() / 1000 - 86400,
            type: 'borrowed' as const,
          },
          {
            loanId: 2,
            amount: 30,
            interestRate: 8,
            duration: 15,
            status: 'repaid',
            nftId: 2,
            createdAt: Date.now() / 1000 - 172800,
            type: 'borrowed' as const,
          },
          {
            loanId: 3,
            amount: 40,
            interestRate: 12,
            duration: 20,
            status: 'active',
            nftId: 3,
            createdAt: Date.now() / 1000 - 43200,
            type: 'borrowed' as const,
          },
        ];

        // Add active and completed arrays as properties
        const result = loans as any;
        result.active = loans.filter(loan => loan.status === 'active');
        result.completed = loans.filter(loan => loan.status !== 'active');
        
        return result;
      } catch (error) {
        console.error('Failed to fetch user loans:', error);
        return [];
      }
    },
    enabled: !!address,
    staleTime: 30000,
  });
}

export function useUserNFTs(address: string) {
  return useQuery({
    queryKey: ['userNFTs', address],
    queryFn: async () => {
      if (!address) return [];
      
      try {
        // Get user's property NFTs
        // For now, returning placeholder data
        return [
          {
            propertyId: 1,
            location: 'New York, NY',
            propertyType: 'Apartment',
            bedrooms: 2,
            bathrooms: 1,
            area: 850,
            yearBuilt: 2010,
            estimatedValue: 75,
            images: ['/api/placeholder/300/200'],
            isUsedAsCollateral: true,
            loanId: 1,
          },
          {
            propertyId: 2,
            location: 'Los Angeles, CA',
            propertyType: 'Condo',
            bedrooms: 1,
            bathrooms: 1,
            area: 650,
            yearBuilt: 2015,
            estimatedValue: 45,
            images: ['/api/placeholder/300/200'],
            isUsedAsCollateral: false,
            loanId: null,
          },
        ];
      } catch (error) {
        console.error('Failed to fetch user NFTs:', error);
        return [];
      }
    },
    enabled: !!address,
    staleTime: 60000,
  });
}

export function useAuctionsData() {
  // Get all active auctions
  const {
    data: activeAuctions,
    isLoading: auctionsLoading,
    error: auctionsError,
  } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const auctionIds = await auraLendClient.getActiveAuctions();
      
      // Similar limitation - we need lender addresses for full details
      return auctionIds.map(auctionId => ({ auctionId, needsDetails: true }));
    },
    refetchInterval: 15000, // Refetch every 15 seconds for auctions (more frequent)
  });

  return {
    activeAuctions,
    auctionsLoading,
    auctionsError,
  };
}

export function useLoanRequest(loanId: number, borrower: string) {
  return useQuery({
    queryKey: ['loanRequest', loanId, borrower],
    queryFn: () => auraLendClient.getLoanRequest(loanId, borrower),
    enabled: !!loanId && !!borrower,
    staleTime: 30000,
  });
}

export function useActiveLoan(loanId: number, lender: string) {
  return useQuery({
    queryKey: ['activeLoan', loanId, lender],
    queryFn: async () => {
      // For now, return placeholder data since getActiveLoan doesn't exist yet
      return {
        loanId,
        borrower: '0x1234...',
        lender,
        nftId: 1,
        principal: 50,
        interestRate: 10,
        fundedAt: Date.now() / 1000 - 3600,
        dueDate: Date.now() / 1000 + 86400,
        repaymentAmount: 55,
        status: 1,
      };
    },
    enabled: !!loanId && !!lender,
    staleTime: 30000,
  });
}

export function useAuction(auctionId: number, lender: string) {
  return useQuery({
    queryKey: ['auction', auctionId, lender],
    queryFn: () => auraLendClient.getAuction(auctionId, lender),
    enabled: !!auctionId && !!lender,
    staleTime: 10000, // More frequent updates for auctions
  });
}

export function usePropertyNFT(propertyId: number, owner: string) {
  return useQuery({
    queryKey: ['propertyNFT', propertyId, owner],
    queryFn: () => auraLendClient.getPropertyNFT(propertyId, owner),
    enabled: !!propertyId && !!owner,
    staleTime: 60000, // NFT data changes less frequently
  });
}

// Hook for getting platform statistics
export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      try {
        // For now, return placeholder data since these stats functions don't exist yet
        return {
          vault: {
            totalLoansCreated: 42,
            totalLoansFunded: 38,
            totalLoansRepaid: 30,
            totalLoansDefaulted: 2,
            totalVolume: 1250000, // in APT micro units
            activeLoansCount: 8,
          },
          auction: {
            totalAuctionsCreated: 5,
            totalAuctionsSettled: 3,
            totalAuctionVolume: 75000,
            activeAuctionsCount: 2,
          },
          registry: {
            totalBorrowers: 25,
            totalLoansProcessed: 40,
            totalVolumeProcessed: 1325000,
          },
        };
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
        return null;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}

// Hook for real-time countdown timer
export function useCountdown(targetTimestamp: number) {
  const { data: timeRemaining, isLoading } = useQuery({
    queryKey: ['countdown', targetTimestamp],
    queryFn: () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, targetTimestamp - now);
      
      return {
        total: remaining,
        days: Math.floor(remaining / 86400),
        hours: Math.floor((remaining % 86400) / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60,
        isExpired: remaining <= 0,
      };
    },
    refetchInterval: 1000, // Update every second
    enabled: targetTimestamp > 0,
  });

  return {
    timeRemaining: timeRemaining || {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    },
    isLoading,
  };
}

// Hook for batch fetching loan requests with details
export function useLoanRequestsWithDetails(requests: { loanId: number; needsDetails: boolean }[]) {
  return useQuery({
    queryKey: ['loanRequestsWithDetails', requests.map(r => r.loanId)],
    queryFn: async () => {
      // This would need to be implemented with proper indexing
      // For now, we'll return placeholder data
      return requests.map(request => ({
        ...request,
        // Placeholder data - in reality, we'd fetch from events or maintain an index
        borrower: '0x1234...', // Would be fetched from events
        amount: 50,
        interestRate: 10,
        duration: 30,
        nftId: 1,
        createdAt: Date.now() / 1000,
        status: 0,
      }));
    },
    enabled: requests.length > 0,
    staleTime: 30000,
  });
}

// Hook for batch fetching auctions with details
export function useAuctionsWithDetails(auctions: { auctionId: number; needsDetails: boolean }[]) {
  return useQuery({
    queryKey: ['auctionsWithDetails', auctions.map(a => a.auctionId)],
    queryFn: async () => {
      // Similar placeholder implementation
      return auctions.map(auction => ({
        ...auction,
        lender: '0x5678...', // Would be fetched from events
        nftId: 1,
        currentBid: 45,
        minBid: 40,
        endTime: Date.now() / 1000 + 3600, // 1 hour from now
        bidCount: 3,
        status: 0,
      }));
    },
    enabled: auctions.length > 0,
    staleTime: 15000,
  });
}
