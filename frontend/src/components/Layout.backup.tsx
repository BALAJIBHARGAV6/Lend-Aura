import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  HandRaisedIcon,
  BanknotesIcon,
  MegaphoneIcon,
  MagnifyingGlassIcon,
  UserIcon,
  WalletIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useAptosWallet } from '@/hooks/useAptosWallet';
import WalletButton from '@/components/WalletButton';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Lend', href: '/lend', icon: HandRaisedIcon },
  { name: 'Borrow', href: '/borrow', icon: BanknotesIcon },
  { name: 'Auctions', href: '/auctions', icon: MegaphoneIcon },
  { name: 'Explorer', href: '/explorer', icon: MagnifyingGlassIcon },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { connected, account, disconnect } = usePetraWallet();
  const { balance } = useAptosWallet();

  const isCurrentPage = (href: string) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-3 focus-ring rounded-lg p-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <div className="h-5 w-5 rounded-full bg-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gradient">
                    Aura Lend
                  </span>
                  <span className="text-xs text-neutral-500 -mt-1">
                    NFT-Backed Lending
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isCurrentPage(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary-50 border border-primary-200 rounded-xl -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Wallet and Profile Section */}
            <div className="flex items-center space-x-4">
              {connected && account ? (
                <div className="flex items-center space-x-4">
                  {/* Balance Display */}
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-neutral-100 rounded-xl">
                    <WalletIcon className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-semibold text-neutral-800">
                      {balance} APT
                    </span>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-xl transition-all duration-200 focus-ring"
                    >
                      <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium">
                          {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
                        </p>
                      </div>
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-soft-lg border border-neutral-200 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-neutral-100">
                            <p className="text-sm font-medium text-neutral-800">
                              Connected Wallet
                            </p>
                            <p className="text-xs text-neutral-500 font-mono mt-1">
                              {account.address}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-neutral-500">Balance:</span>
                              <span className="text-sm font-semibold text-neutral-800">
                                {balance} APT
                              </span>
                            </div>
                          </div>
                          <div className="py-1">
                            <Link
                              to="/profile"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                            >
                              <UserIcon className="h-5 w-5 mr-3" />
                              View Profile
                            </Link>
                            <button
                              onClick={() => {
                                disconnect();
                                setProfileMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <XMarkIcon className="h-5 w-5 mr-3" />
                              Disconnect
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <WalletButton />
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg focus-ring"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Mobile Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl lg:hidden"
              >
                <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
                  <span className="text-lg font-semibold text-neutral-800">Menu</span>
                  <button
                    type="button"
                    className="p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="px-6 py-6 space-y-6">
                  {/* Mobile Navigation Links */}
                  <nav className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = isCurrentPage(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200
                            ${
                              isActive
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                            }
                          `}
                        >
                          <Icon className="h-6 w-6" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile Wallet Section */}
                  {connected && account && (
                    <div className="pt-6 border-t border-neutral-200">
                      <div className="flex items-center space-x-3 px-4 py-3 bg-neutral-50 rounded-xl">
                        <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {balance} APT
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-200 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <div className="h-5 w-5 rounded-full bg-white" />
                </div>
                <span className="text-xl font-bold text-gradient">Aura Lend</span>
              </div>
              <p className="text-sm text-neutral-600 max-w-md">
                Unlock the value of your digital assets with decentralized NFT-backed lending on Aptos. 
                Secure, transparent, and efficient.
              </p>
              <div className="mt-4">
                <p className="text-xs text-neutral-500">
                  Built on Aptos • Powered by Move
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">Platform</h3>
              <ul className="space-y-2">
                {navigation.slice(1).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center">
              © 2024 Aura Lend. All rights reserved. Built with ❤️ on Aptos.
            </p>
          </div>
        </div>
      </footer>

      {/* Click outside handler for profile menu */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </div>
  );
}
