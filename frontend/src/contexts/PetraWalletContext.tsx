import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for Petra wallet
interface PetraWallet {
  connect(): Promise<{ address: string; publicKey: string }>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  getAccount(): Promise<{ address: string; publicKey: string }>;
  getNetwork(): Promise<{ name: string }>;
  signAndSubmitTransaction(transaction: any): Promise<any>;
  signTransaction(transaction: any): Promise<any>;
}

declare global {
  interface Window {
    petra?: PetraWallet;
    aptos?: PetraWallet;
  }
}

interface WalletState {
  connected: boolean;
  connecting: boolean;
  account: { address: string; publicKey: string } | null;
  network: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
}

const PetraWalletContext = createContext<WalletContextType | undefined>(undefined);

export const PetraWalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    connecting: false,
    account: null,
    network: null,
  });

  // Check if Petra wallet is installed
  const getPetraWallet = (): PetraWallet | null => {
    if (typeof window !== 'undefined') {
      return window.petra || window.aptos || null;
    }
    return null;
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wallet = getPetraWallet();
      if (wallet) {
        try {
          const isConnected = await wallet.isConnected();
          if (isConnected) {
            const account = await wallet.getAccount();
            const network = await wallet.getNetwork();
            setWalletState({
              connected: true,
              connecting: false,
              account,
              network: network.name,
            });
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    const wallet = getPetraWallet();
    if (!wallet) {
      alert('Petra Wallet is not installed! Please install it from Chrome Web Store.');
      window.open('https://petra.app/', '_blank');
      return;
    }

    setWalletState(prev => ({ ...prev, connecting: true }));

    try {
      const account = await wallet.connect();
      const network = await wallet.getNetwork();
      
      setWalletState({
        connected: true,
        connecting: false,
        account,
        network: network.name,
      });

      console.log('Successfully connected to Petra wallet:', account.address);
    } catch (error) {
      console.error('Failed to connect to Petra wallet:', error);
      setWalletState(prev => ({ ...prev, connecting: false }));
      alert('Failed to connect to Petra wallet. Please try again.');
    }
  };

  const disconnect = async () => {
    const wallet = getPetraWallet();
    if (wallet) {
      try {
        await wallet.disconnect();
        setWalletState({
          connected: false,
          connecting: false,
          account: null,
          network: null,
        });
        console.log('Disconnected from Petra wallet');
      } catch (error) {
        console.error('Failed to disconnect from Petra wallet:', error);
      }
    }
  };

  const signAndSubmitTransaction = async (transaction: any) => {
    const wallet = getPetraWallet();
    if (!wallet || !walletState.connected) {
      throw new Error('Petra wallet is not connected');
    }

    try {
      const result = await wallet.signAndSubmitTransaction(transaction);
      console.log('Transaction submitted:', result);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return (
    <PetraWalletContext.Provider 
      value={{ 
        ...walletState, 
        connect, 
        disconnect, 
        signAndSubmitTransaction 
      }}
    >
      {children}
    </PetraWalletContext.Provider>
  );
};

export const usePetraWallet = () => {
  const context = useContext(PetraWalletContext);
  if (context === undefined) {
    throw new Error('usePetraWallet must be used within a PetraWalletProvider');
  }
  return context;
};
