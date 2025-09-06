import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletState {
  connected: boolean;
  connecting: boolean;
  account: any | null;
  network: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    connecting: false,
    account: null,
    network: null,
  });

  // Simple mock wallet implementation for development
  const connect = async () => {
    setWalletState(prev => ({ ...prev, connecting: true }));
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock account data
    setWalletState({
      connected: true,
      connecting: false,
      account: {
        address: "0x1234567890abcdef",
        publicKey: "0xmockpubkey",
        accountAddress: "0x1234567890abcdef"
      },
      network: "devnet",
    });
  };

  const disconnect = async () => {
    setWalletState({
      connected: false,
      connecting: false,
      account: null,
      network: null,
    });
  };

  return (
    <WalletContext.Provider value={{ ...walletState, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
