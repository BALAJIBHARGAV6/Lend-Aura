import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auraLendClient } from '@/utils/aptos';

export function useLoansData() {
  // Get all active loan requests with real on-chain data
  const {
    data: activeLoanRequests,
    isLoading: loanRequestsLoading,
    error: loanRequestsError,
  } = useQuery({
    queryKey: ['activeLoanRequests'],
    queryFn: async () => {
      try {
        const loanIds = await auraLendClient.getActiveLoanRequests();
        console.log('Fetched loan IDs:', loanIds);
        return loanIds;
      } catch (error) {
        console.error('Error fetching active loan requests:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get all active loans with real on-chain data
  const {
    data: activeLoans,
    isLoading: activeLoansLoading,
    error: activeLoansError,
  } = useQuery({
    queryKey: ['activeLoans'],
    queryFn: async () => {
      try {
        const loanIds = await auraLendClient.getActiveLoans();
        console.log('Fetched active loans:', loanIds);
        return loanIds;
      } catch (error) {
        console.error('Error fetching active loans:', error);
        return [];
      }
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

      try {
        // Real blockchain search implementation
        const results: any[] = [];

        // Search for loan requests
        if (filterType === 'all' || filterType === 'loans') {
          const loanIds = await auraLendClient.getActiveLoanRequests();
          for (const loanId of loanIds) {
            results.push({
              type: 'loan' as const,
              id: `loan-${loanId}`,
              title: `Loan Request #${loanId}`,
              description: `On-chain loan request with ID ${loanId}`,
              metadata: {
                amount: 'Loading...',
                rate: 'Loading...',
                duration: 'Loading...',
                status: 'Active'
              },
              timestamp: Date.now() / 1000,
            });
          }
        }

        // Search for auctions
        if (filterType === 'all' || filterType === 'auctions') {
          const auctionIds = await auraLendClient.getActiveAuctions();
          for (const auctionId of auctionIds) {
            results.push({
              type: 'auction' as const,
              id: `auction-${auctionId}`,
              title: `Auction #${auctionId}`,
              description: `On-chain auction with ID ${auctionId}`,
              metadata: {
                highestBid: 'Loading...',
                bidders: 'Loading...',
                timeLeft: 'Loading...',
                status: 'Active'
              },
              timestamp: Date.now() / 1000,
            });
          }
        }

        // Filter results based on search query
        const filtered = results.filter(result => {
          const query = searchQuery.toLowerCase();
          return (
            result.title.toLowerCase().includes(query) ||
            result.description.toLowerCase().includes(query) ||
            result.id.toLowerCase().includes(query)
          );
        });

        return filtered;
      } catch (error) {
        console.error('Error searching blockchain data:', error);
        return [];
      }
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
        ];

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
      try {
        const auctionIds = await auraLendClient.getActiveAuctions();
        console.log('Fetched auction IDs:', auctionIds);
        return auctionIds;
      } catch (error) {
        console.error('Error fetching active auctions:', error);
        return [];
      }
    },
    refetchInterval: 15000, // Refetch every 15 seconds for auctions (more frequent)
  });

  return {
    activeAuctions,
    auctionsLoading,
    auctionsError,
  };
}

export function useAuctionsWithDetails(auctions: { auctionId: number; needsDetails: boolean }[]) {
  return useQuery({
    queryKey: ['auctionsWithDetails', auctions.map(a => a.auctionId)],
    queryFn: async () => {
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

// Hook for getting platform statistics using real on-chain data
export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      try {
        // Get real statistics from the blockchain
        const activeLoanRequests = await auraLendClient.getActiveLoanRequests();
        const activeLoans = await auraLendClient.getActiveLoans();
        const activeAuctions = await auraLendClient.getActiveAuctions();

        return {
          vault: {
            totalLoansCreated: 0, // Would need event indexing
            totalLoansFunded: activeLoans.length,
            totalLoansRepaid: 0, // Would need event indexing
            totalLoansDefaulted: 0, // Would need event indexing
            totalVolume: 0, // Would need event indexing
            activeLoansCount: activeLoans.length,
            activeLoanRequestsCount: activeLoanRequests.length,
          },
          auction: {
            totalAuctionsCreated: 0, // Would need event indexing
            totalAuctionsSettled: 0, // Would need event indexing
            totalAuctionVolume: 0, // Would need event indexing
            activeAuctionsCount: activeAuctions.length,
          },
          registry: {
            totalBorrowers: 0, // Would need event indexing
            totalLoansProcessed: 0, // Would need event indexing
            totalVolumeProcessed: 0, // Would need event indexing
          },
        };
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
        return {
          vault: {
            totalLoansCreated: 0,
            totalLoansFunded: 0,
            totalLoansRepaid: 0,
            totalLoansDefaulted: 0,
            totalVolume: 0,
            activeLoansCount: 0,
            activeLoanRequestsCount: 0,
          },
          auction: {
            totalAuctionsCreated: 0,
            totalAuctionsSettled: 0,
            totalAuctionVolume: 0,
            activeAuctionsCount: 0,
          },
          registry: {
            totalBorrowers: 0,
            totalLoansProcessed: 0,
            totalVolumeProcessed: 0,
          },
        };
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}
