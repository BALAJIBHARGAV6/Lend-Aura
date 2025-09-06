import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { auraLendClient } from "@/utils/aptos";

export const useAptosWallet = () => {
  const { connected, connecting, account, connect, disconnect } = useWallet();
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch wallet balance
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['walletBalance', account],
    queryFn: async () => {
      if (!account) return null;
      
      try {
        // For mock wallet, return a placeholder balance
        return 100000000; // 1 APT in micro units
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
      if (!account) throw new Error('Wallet not connected');
      
      // Mock transaction signing
      console.log('Signing transaction:', transactionPayload);
      return {
        hash: '0x' + Math.random().toString(16).substr(2, 8),
        success: true,
      };
    },
    onError: (error) => {
      console.error('Transaction signing failed:', error);
    },
  });

  const submitTransactionMutation = useMutation({
    mutationFn: async (signedTransaction: any) => {
      // Mock transaction submission
      console.log('Submitting transaction:', signedTransaction);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      return {
        hash: signedTransaction.hash,
        success: true,
      };
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

  return {
    // Wallet state
    connected,
    connecting: connecting || connectMutation.isPending,
    account,
    balance,
    balanceLoading,
    
    // Connection methods
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    
    // Transaction methods
    signTransaction: signTransactionMutation.mutateAsync,
    submitTransaction: submitTransactionMutation.mutateAsync,
    
    // Loading states
    isConnecting: connecting || connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSigning: signTransactionMutation.isPending,
    isSubmitting: submitTransactionMutation.isPending,
    
    // Errors
    connectionError: connectMutation.error,
    transactionError: signTransactionMutation.error || submitTransactionMutation.error,

    // Helper methods
    formatBalance: (amount: number) => auraLendClient.formatAPT(amount),
    parseAmount: (amount: string) => auraLendClient.parseAPT(amount),
  };
};
