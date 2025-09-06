import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Earth3D } from '../components/ui/Earth3D';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

// Mock data for demonstration
const mockStats = {
  totalValueLocked: 125000000,
  totalLoans: 8432,
  totalNFTs: 15678,
  activeUsers: 3245
};

const mockRecentActivity = [
  { id: 1, type: 'loan', nft: 'Property NFT #1234', amount: '50 APT', status: 'active' },
  { id: 2, type: 'repay', nft: 'Property NFT #567', amount: '25 APT', status: 'completed' },
  { id: 3, type: 'auction', nft: 'Property NFT #890', amount: '15 APT', status: 'bidding' },
];

const features = [
  {
    icon: '🔒',
    title: 'Secure NFT Collateral',
    description: 'Your Property NFTs are safely locked in smart contracts with full transparency and security guarantees.'
  },
  {
    icon: '⚡',
    title: 'Instant Liquidity',
    description: 'Get instant access to liquidity by using your NFTs as collateral without selling them.'
  },
  {
    icon: '📊',
    title: 'Dynamic Pricing',
    description: 'Advanced AI-powered pricing algorithms ensure fair market valuations for all NFTs.'
  },
  {
    icon: '🌐',
    title: 'Global Access',
    description: 'Access the lending platform from anywhere in the world with just a crypto wallet.'
  },
  {
    icon: '💎',
    title: 'Premium Collections',
    description: 'Support for top-tier NFT collections with optimized lending parameters.'
  },
  {
    icon: '🤝',
    title: 'Community Driven',
    description: 'Decentralized governance allows the community to shape the platform\'s future.'
  }
];

export default function HomePage() {
  const { connected, account } = useWallet();
  const { showToast } = useToast();
  const [displayStats, setDisplayStats] = useState({
    totalValueLocked: 0,
    totalLoans: 0,
    totalNFTs: 0,
    activeUsers: 0
  });

  // Animate stats on load
  useEffect(() => {
    const animateValue = (start: number, end: number, setter: (value: number) => void) => {
      const duration = 2000;
      const stepTime = 50;
      const steps = duration / stepTime;
      const increment = (end - start) / steps;
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, stepTime);
    };

    setTimeout(() => {
      animateValue(0, mockStats.totalValueLocked, (value) => 
        setDisplayStats(prev => ({ ...prev, totalValueLocked: value }))
      );
      animateValue(0, mockStats.totalLoans, (value) => 
        setDisplayStats(prev => ({ ...prev, totalLoans: value }))
      );
      animateValue(0, mockStats.totalNFTs, (value) => 
        setDisplayStats(prev => ({ ...prev, totalNFTs: value }))
      );
      animateValue(0, mockStats.activeUsers, (value) => 
        setDisplayStats(prev => ({ ...prev, activeUsers: value }))
      );
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  The Future of{' '}
                  <span className="text-gradient bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    NFT Lending
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                  Unlock the value of your Property NFTs with instant liquidity. Lend, borrow, and trade 
                  with confidence on the most advanced DeFi platform built on Aptos.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to={connected ? "/lend" : "#"}
                  onClick={() => !connected && showToast('warning', 'Please connect your wallet first')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Start Lending
                </Link>
                <Link
                  to={connected ? "/borrow" : "#"}
                  onClick={() => !connected && showToast('warning', 'Please connect your wallet first')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Borrow Now
                </Link>
              </motion.div>

              {/* Connection Status */}
              {connected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 inline-flex items-center space-x-3 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Wallet Connected</span>
                </motion.div>
              )}
            </div>

            {/* 3D Earth Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <Earth3D size="large" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(displayStats.totalValueLocked)}
              </div>
              <div className="text-gray-600 font-medium">Total Value Locked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {displayStats.totalLoans.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Active Loans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {displayStats.totalNFTs.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">NFTs Collateralized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {displayStats.activeUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aura Lend?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of DeFi lending with cutting-edge features 
              designed for the modern NFT ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-interactive text-center p-8"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <p className="text-xl text-gray-600">
              See what's happening on the platform in real-time
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {mockRecentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card flex items-center justify-between p-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activity.type === 'loan' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'repay' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'loan' ? '💰' : activity.type === 'repay' ? '✅' : '⚡'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 capitalize">
                        {activity.type} - {activity.nft}
                      </div>
                      <div className="text-gray-600">Amount: {activity.amount}</div>
                    </div>
                  </div>
                  <div className={`badge ${
                    activity.status === 'active' ? 'badge-primary' :
                    activity.status === 'completed' ? 'badge-success' :
                    'badge-warning'
                  }`}>
                    {activity.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already earning and borrowing with their NFTs
            </p>
            <Link
              to={connected ? "/portfolio" : "#"}
              onClick={() => !connected && showToast('info', 'Connect your wallet to access your portfolio')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Launch App
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
