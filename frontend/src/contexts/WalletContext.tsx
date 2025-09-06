import React, { createContext, useContext, useState, useEffect } from 'react';

// Petra Wallet Types
interface PetraWallet {
  connect(): Promise<{ address: string; publicKey: string }>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  account(): Promise<{ address: string; publicKey: string }>;
  network(): Promise<string>;
  signAndSubmitTransaction(transaction: any): Promise<any>;
  signMessage(message: any): Promise<any>;
}

interface WalletContextType {
  connected: boolean;
  account: string | null;
  publicKey: string | null;
  network: string | null;
  connecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: any) => Promise<any>;
  // Legacy compatibility
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Petra wallet instance
  const getPetraWallet = (): PetraWallet | null => {
    if (typeof window !== 'undefined' && 'aptos' in window) {
      return (window as any).aptos;
    }
    return null;
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wallet = getPetraWallet();
      if (wallet) {
        try {
          const isConnected = await wallet.isConnected();
          if (isConnected) {
            const accountInfo = await wallet.account();
            const networkInfo = await wallet.network();
            
            setConnected(true);
            setAccount(accountInfo.address);
            setPublicKey(accountInfo.publicKey);
            setNetwork(networkInfo);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    const wallet = getPetraWallet();
    
    if (!wallet) {
      // Fallback to mock for development
      console.log('Petra wallet not found, using mock wallet for development');
      setConnecting(true);
      setError(null);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock account data for development
      setConnected(true);
      setAccount('0x593c05afb0b61418fd5c87aa150f57ed70eb4761fe555645f4822cb374ddae0f');
      setPublicKey('0xmockpubkey');
      setNetwork('devnet');
      setConnecting(false);
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accountInfo = await wallet.connect();
      const networkInfo = await wallet.network();
      
      setConnected(true);
      setAccount(accountInfo.address);
      setPublicKey(accountInfo.publicKey);
      setNetwork(networkInfo);
      setError(null);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setConnected(false);
      setAccount(null);
      setPublicKey(null);
      setNetwork(null);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    const wallet = getPetraWallet();
    
    if (wallet) {
      try {
        await wallet.disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    
    setConnected(false);
    setAccount(null);
    setPublicKey(null);
    setNetwork(null);
    setError(null);
  };

  const signAndSubmitTransaction = async (transaction: any) => {
    const wallet = getPetraWallet();
    
    if (!wallet || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await wallet.signAndSubmitTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const signMessage = async (message: any) => {
    const wallet = getPetraWallet();
    
    if (!wallet || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await wallet.signMessage(message);
      return result;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  };

  const value: WalletContextType = {
    connected,
    account,
    publicKey,
    network,
    connecting,
    error,
    connectWallet,
    disconnectWallet,
    signAndSubmitTransaction,
    signMessage,
    // Legacy compatibility
    connect: connectWallet,
    disconnect: disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// For compatibility with existing code
export const useWalletContext = useWallet;
