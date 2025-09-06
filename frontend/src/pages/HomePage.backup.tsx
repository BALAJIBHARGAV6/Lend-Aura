import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  HandRaisedIcon,
  BanknotesIcon,
  MegaphoneIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { usePlatformStats } from '@/hooks/useLoansData';
import { useAptosWallet } from '@/hooks/useAptosWallet';
import { auraLendClient } from '@/utils/aptos';
import { AnimatedNumber } from '@/components/AnimatedComponents';
import { GlowButton, PulsingDot } from '@/components/LoadingComponents';

const features = [
  {
    name: 'Secure Collateral',
    description: 'Your Property NFTs are safely held in smart contracts with multi-signature security.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Competitive Rates',
    description: 'Market-driven interest rates ensure fair pricing for both borrowers and lenders.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Transparent Auctions',
    description: 'Defaulted collateral is auctioned transparently with full on-chain settlement.',
    icon: ChartBarIcon,
  },
];

const stats = [
  { name: 'Total Volume', value: '$2.1M', change: '+12%' },
  { name: 'Active Loans', value: '156', change: '+8%' },
  { name: 'Successful Repayments', value: '94%', change: '+2%' },
  { name: 'Total Lenders', value: '1.2K', change: '+15%' },
];

export default function HomePage() {
  const { data: platformStats } = usePlatformStats();
  const { connected, connect, isConnecting } = useAptosWallet();

  const formatVolume = (volume: number) => {
    if (!volume) return '$0';
    const apt = auraLendClient.formatAPT(volume);
    return `${parseFloat(apt).toFixed(0)} APT`;
  };

  const formattedStats = platformStats ? [
    { 
      name: 'Total Volume', 
      value: formatVolume(platformStats.vault.totalVolume), 
      change: '+12%' 
    },
    { 
      name: 'Active Loans', 
      value: platformStats.vault.activeLoansCount.toString(), 
      change: '+8%' 
    },
    { 
      name: 'Success Rate', 
      value: platformStats.vault.totalLoansFunded > 0 
        ? `${Math.round((platformStats.vault.totalLoansRepaid / platformStats.vault.totalLoansFunded) * 100)}%`
        : '0%', 
      change: '+2%' 
    },
    { 
      name: 'Total Users', 
      value: platformStats.registry.totalBorrowers.toString(), 
      change: '+15%' 
    },
  ] : stats;

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with 3D Earth Animation */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-primary-50">
        {/* Background 3D Earth Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <motion.div
            className="earth-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <div className="earth-sphere" />
          </motion.div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium"
            >
              <PulsingDot size="sm" color="primary" />
              <span>Powered by Aptos Move Smart Contracts</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight">
              Unlock Your{' '}
              <span className="text-gradient bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Digital Assets
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-neutral-600 leading-relaxed">
              The premier NFT-backed lending protocol on Aptos. Lend your APT to earn yield,
              or borrow against your Property NFTs with transparent, decentralized finance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/lend" className="btn-primary text-lg px-8 py-4">
                  Start Lending
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/borrow" className="btn-secondary text-lg px-8 py-4">
                  Borrow Now
                  <BanknotesIcon className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>

            {/* Quick stats */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto"
            >
              {formattedStats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="text-center group"
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {platformStats && stat.name === 'Total Volume' ? (
                      <AnimatedNumber 
                        value={platformStats.vault.totalVolume}
                        formatValue={(val) => formatVolume(val)}
                      />
                    ) : platformStats && stat.name === 'Active Loans' ? (
                      <AnimatedNumber 
                        value={platformStats.vault.activeLoansCount}
                        formatValue={(val) => Math.round(val).toString()}
                      />
                    ) : platformStats && stat.name === 'Total Users' ? (
                      <AnimatedNumber 
                        value={platformStats.registry.totalBorrowers}
                        formatValue={(val) => Math.round(val).toString()}
                      />
                    ) : (
                      stat.value
                    )}
                  </motion.div>
                  <div className="text-sm text-neutral-600 mb-1">{stat.name}</div>
                  <motion.div 
                    className="text-xs text-success-600 font-medium"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    {stat.change}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-neutral-300 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-neutral-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Built for the Future of Finance
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600">
              Experience the next generation of decentralized lending with advanced security,
              transparency, and efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 border border-primary-200 rounded-2xl mb-6"
                  >
                    <Icon className="w-8 h-8 text-primary-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              How Aura Lend Works
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600">
              Simple, secure, and transparent lending process powered by smart contracts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* For Borrowers */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="card text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                For Borrowers
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-neutral-600">Mint and attest your Property NFT</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-neutral-600">Create a loan request with terms</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-neutral-600">Receive APT when funded</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-neutral-600">Repay to reclaim your NFT</p>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/borrow" className="btn-primary w-full">
                  Start Borrowing
                </Link>
              </div>
            </motion.div>

            {/* For Lenders */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="card text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 border border-green-200 rounded-xl mb-6">
                <HandRaisedIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                For Lenders
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-neutral-600">Browse available loan requests</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-neutral-600">Evaluate collateral and terms</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-neutral-600">Fund the loan with APT</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-neutral-600">Earn interest on repayment</p>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/lend" className="btn-primary w-full">
                  Start Lending
                </Link>
              </div>
            </motion.div>

            {/* Auctions */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="card text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-50 border border-orange-200 rounded-xl mb-6">
                <MegaphoneIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Defaulted Collateral
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-neutral-600">Loan defaults after due date</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-neutral-600">Automatic auction initiated</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-neutral-600">Community bids on NFT</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-neutral-600">Transparent settlement</p>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/auctions" className="btn-primary w-full">
                  View Auctions
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-blue-100">
              Join thousands of users who trust Aura Lend for their DeFi lending needs.
              Connect your wallet and start earning or borrowing today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {connected ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/lend" 
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-xl shadow-lg hover:bg-neutral-50 transition-all duration-200"
                    >
                      Explore Opportunities
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                </>
              ) : (
                <div className="text-white">
                  <p className="mb-4">Connect your wallet to get started</p>
                  <GlowButton
                    onClick={connect}
                    loading={isConnecting}
                    variant="secondary"
                    size="lg"
                    className="inline-flex items-center"
                  >
                    <WalletIcon className="mr-2 h-5 w-5" />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </GlowButton>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
