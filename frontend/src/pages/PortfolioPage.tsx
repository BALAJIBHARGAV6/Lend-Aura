import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

interface Portfolio {
  lending: {
    totalLent: number;
    activeLoans: number;
    totalEarned: number;
    avgApy: number;
  };
  borrowing: {
    totalBorrowed: number;
    activeLoans: number;
    totalPaid: number;
    nextPayment: {
      amount: number;
      dueDate: string;
    };
  };
  nfts: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    status: 'available' | 'collateral' | 'auction';
  }>;
  transactions: Array<{
    id: string;
    type: 'lend' | 'borrow' | 'repay' | 'withdraw';
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

const mockPortfolio: Portfolio = {
  lending: {
    totalLent: 12500,
    activeLoans: 8,
    totalEarned: 1250,
    avgApy: 14.2,
  },
  borrowing: {
    totalBorrowed: 5500,
    activeLoans: 2,
    totalPaid: 650,
    nextPayment: {
      amount: 275,
      dueDate: '2024-02-15',
    },
  },
  nfts: [
    { id: '1', name: 'Property NFT #1234', type: 'Residential', value: 2500, status: 'collateral' },
    { id: '2', name: 'Property NFT #5678', type: 'Commercial', value: 4200, status: 'available' },
    { id: '3', name: 'Property NFT #9012', type: 'Land', value: 1800, status: 'available' },
  ],
  transactions: [
    { id: '1', type: 'lend', amount: 1000, date: '2024-01-28', status: 'completed' },
    { id: '2', type: 'borrow', amount: 500, date: '2024-01-25', status: 'completed' },
    { id: '3', type: 'repay', amount: 125, date: '2024-01-20', status: 'completed' },
    { id: '4', type: 'withdraw', amount: 250, date: '2024-01-15', status: 'completed' },
  ],
};

export default function PortfolioPage() {
  const { connected, account } = useWallet();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'lending' | 'borrowing' | 'nfts' | 'history'>('overview');

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6">👛</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your Petra wallet to view your portfolio and manage your assets.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'collateral': return 'text-blue-600 bg-blue-100';
      case 'auction': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lend': return '💰';
      case 'borrow': return '🏦';
      case 'repay': return '✅';
      case 'withdraw': return '🔄';
      default: return '📊';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'lending', label: 'Lending' },
    { id: 'borrowing', label: 'Borrowing' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your lending, borrowing, and NFT activities all in one place.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center space-x-1 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${(mockPortfolio.lending.totalLent + mockPortfolio.borrowing.totalBorrowed).toLocaleString()}
                </div>
                <div className="text-gray-600">Total Value</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${mockPortfolio.lending.totalEarned.toLocaleString()}
                </div>
                <div className="text-gray-600">Total Earned</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {mockPortfolio.lending.activeLoans + mockPortfolio.borrowing.activeLoans}
                </div>
                <div className="text-gray-600">Active Loans</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {mockPortfolio.nfts.length}
                </div>
                <div className="text-gray-600">NFTs Owned</div>
              </div>
            </div>

            {/* Portfolio Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Lending Portfolio</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Lent</span>
                    <span className="font-semibold text-lg">${mockPortfolio.lending.totalLent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Loans</span>
                    <span className="font-semibold">{mockPortfolio.lending.activeLoans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Earned</span>
                    <span className="font-semibold text-green-600">${mockPortfolio.lending.totalEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average APY</span>
                    <span className="font-semibold text-blue-600">{mockPortfolio.lending.avgApy}%</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Borrowing Portfolio</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Borrowed</span>
                    <span className="font-semibold text-lg">${mockPortfolio.borrowing.totalBorrowed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Loans</span>
                    <span className="font-semibold">{mockPortfolio.borrowing.activeLoans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-semibold">${mockPortfolio.borrowing.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Payment</span>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">${mockPortfolio.borrowing.nextPayment.amount}</div>
                      <div className="text-sm text-gray-500">{mockPortfolio.borrowing.nextPayment.dueDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* NFTs Tab */}
        {activeTab === 'nfts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPortfolio.nfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-interactive"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏠</div>
                      <div className="font-semibold text-gray-900">{nft.name}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold">{nft.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Value</span>
                      <span className="font-semibold">${nft.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`badge ${getStatusColor(nft.status)}`}>
                        {nft.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {nft.status === 'available' ? (
                      <button className="btn-primary w-full">
                        Use as Collateral
                      </button>
                    ) : nft.status === 'collateral' ? (
                      <button className="btn-secondary w-full" disabled>
                        Currently Locked
                      </button>
                    ) : (
                      <button className="btn-danger w-full" disabled>
                        In Auction
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h3>
              <div className="space-y-4">
                {mockPortfolio.transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {tx.type} - ${tx.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">{tx.date}</div>
                      </div>
                    </div>
                    <div className={`badge ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => showToast('info', 'Redirecting to lending page...')}
              className="btn-primary"
            >
              Start Lending
            </button>
            <button 
              onClick={() => showToast('info', 'Redirecting to borrowing page...')}
              className="btn-secondary"
            >
              Create Loan Request
            </button>
            <button 
              onClick={() => showToast('info', 'Mint NFT feature coming soon!')}
              className="btn-ghost"
            >
              Mint Property NFT
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
