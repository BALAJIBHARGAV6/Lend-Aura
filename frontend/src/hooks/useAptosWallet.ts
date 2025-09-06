import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { auraLendClient } from "@/utils/aptos";

export const useAptosWallet = () => {
  const { connected, connecting, account, connect, disconnect, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch wallet balance
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['walletBalance', account],
    queryFn: async () => {
      if (!account) return null;
      
      try {
        // Fetch real balance from Aptos
        const balance = await auraLendClient.getAccountAPTBalance(account);
        return balance;
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        return null;
      }
    },
    enabled: connected && !!account,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setBalance(walletBalance || null);
  }, [walletBalance]);

  // Connection mutations
  const connectMutation = useMutation({
    mutationFn: connect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
    onError: (error) => {
      console.error('Wallet connection failed:', error);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnect,
    onSuccess: () => {
      setBalance(null);
      queryClient.clear();
    },
  });

  // Transaction mutations
  const signTransactionMutation = useMutation({
    mutationFn: async (transactionPayload: any) => {
      if (!account) throw new Error('Petra wallet not connected');
      
      try {
        const result = await signAndSubmitTransaction(transactionPayload);
        return result;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Transaction signing failed:', error);
    },
  });

  const submitTransactionMutation = useMutation({
    mutationFn: async (signedTransaction: any) => {
      // For Petra wallet, signing and submitting is done in one step
      // This is just for compatibility with existing code
      return signedTransaction;
    },
    onSuccess: () => {
      // Refresh balance and other queries after successful transaction
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['activeLoanRequests'] });
      queryClient.invalidateQueries({ queryKey: ['activeLoans'] });
      queryClient.invalidateQueries({ queryKey: ['activeAuctions'] });
    },
    onError: (error) => {
      console.error('Transaction submission failed:', error);
    },
  });

  // DeFi-specific transaction mutations
  const mintNFTMutation = useMutation({
    mutationFn: async (params: { valuationHash: string; metadataUri: string }) => {
      if (!account) throw new Error('Wallet not connected');
      return auraLendClient.mintPropertyNFT(account, params.valuationHash, params.metadataUri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
  });

  const createLoanMutation = useMutation({
    mutationFn: async (params: { nftId: number; nftOwner: string; amount: number; interestRate: number; duration: number }) => {
      if (!account) throw new Error('Wallet not connected');
      return auraLendClient.createLoanRequest(account, params.nftId, params.nftOwner, params.amount, params.interestRate, params.duration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoanRequests'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
  });

  const fundLoanMutation = useMutation({
    mutationFn: async (params: { loanId: number; borrowerAddress: string }) => {
      if (!account) throw new Error('Wallet not connected');
      return auraLendClient.fundLoan(account, params.loanId, params.borrowerAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoanRequests'] });
      queryClient.invalidateQueries({ queryKey: ['activeLoans'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: async (params: { auctionId: number; lenderAddress: string; bidAmount: number }) => {
      if (!account) throw new Error('Wallet not connected');
      return auraLendClient.placeBid(account, params.auctionId, params.lenderAddress, params.bidAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeAuctions'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
  });

  // Fetch user properties
  const { data: userProperties } = useQuery({
    queryKey: ['userProperties', account],
    queryFn: async () => {
      if (!account) return [];
      return auraLendClient.getUserProperties(account);
    },
    enabled: connected && !!account,
  });

  return {
    // Wallet state
    connected,
    connecting: connecting || connectMutation.isPending,
    account,
    balance: balance || 0,
    balanceLoading,
    
    // Connection methods
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    connectWallet: connectMutation.mutate, // Alias for compatibility
    disconnectWallet: disconnectMutation.mutate, // Alias for compatibility
    
    // Transaction methods
    signTransaction: signTransactionMutation.mutateAsync,
    submitTransaction: submitTransactionMutation.mutateAsync,
    
    // DeFi-specific methods
    mintNFT: mintNFTMutation.mutateAsync,
    createLoan: createLoanMutation.mutateAsync,
    fundLoan: fundLoanMutation.mutateAsync,
    placeBid: placeBidMutation.mutateAsync,
    
    // User data
    userProperties: userProperties || [],
    
    // Loading states
    isConnecting: connecting || connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSigning: signTransactionMutation.isPending,
    isSubmitting: submitTransactionMutation.isPending,
    isMintingNFT: mintNFTMutation.isPending,
    isCreatingLoan: createLoanMutation.isPending,
    isFundingLoan: fundLoanMutation.isPending,
    isPlacingBid: placeBidMutation.isPending,
    
    // Errors
    connectionError: connectMutation.error,
    transactionError: signTransactionMutation.error || submitTransactionMutation.error,

    // Helper methods
    formatBalance: (amount: number) => auraLendClient.formatAPT(amount),
    parseAmount: (amount: string) => auraLendClient.parseAPT(amount),
  };
};
