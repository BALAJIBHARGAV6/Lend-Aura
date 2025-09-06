import React from 'react';
import { motion } from 'framer-motion';
import { WalletIcon } from '@heroicons/react/24/outline';
import { usePetraWallet } from '@/contexts/PetraWalletContext';

const WalletButton: React.FC = () => {
  const { connected, connecting, connect, disconnect, account } = usePetraWallet();

  if (connected && account) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="btn-secondary text-sm py-2 px-4"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect()}
      disabled={connecting}
      className="btn-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {connecting ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        'Connect Petra Wallet'
      )}
    </button>
  );
};

export default WalletButton;
