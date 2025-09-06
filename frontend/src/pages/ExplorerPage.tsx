import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useExplorerData } from '@/hooks/useLoansData';

type FilterType = 'all' | 'nfts' | 'loans' | 'auctions' | 'addresses';

interface SearchResult {
  type: 'nft' | 'loan' | 'auction' | 'address';
  id: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  timestamp?: number;
}

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const { searchResults, isSearching, searchHistory } = useExplorerData(searchQuery, filterType);

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    
    return searchResults.filter(result => {
      if (filterType === 'all') return true;
      if (filterType === 'nfts') return result.type === 'nft';
      if (filterType === 'loans') return result.type === 'loan';
      if (filterType === 'auctions') return result.type === 'auction';
      if (filterType === 'addresses') return result.type === 'address';
      return true;
    });
  }, [searchResults, filterType]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'nft': return DocumentTextIcon;
      case 'loan': return CurrencyDollarIcon;
      case 'auction': return ClockIcon;
      case 'address': return UserIcon;
      default: return DocumentTextIcon;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case 'nft': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'loan': return 'bg-success-100 text-success-800 border-success-200';
      case 'auction': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'address': return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Protocol Explorer
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Search and explore Property NFTs, loans, auctions, and user addresses on Aura Lend.
        </p>
      </motion.div>

      {/* Search Interface */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search by NFT ID, loan ID, wallet address, or transaction hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="spinner" />
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All Results', icon: MagnifyingGlassIcon },
            { key: 'nfts', label: 'Property NFTs', icon: DocumentTextIcon },
            { key: 'loans', label: 'Loans', icon: CurrencyDollarIcon },
            { key: 'auctions', label: 'Auctions', icon: ClockIcon },
            { key: 'addresses', label: 'Addresses', icon: UserIcon },
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterType(key as FilterType)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                filterType === key
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Results List */}
        <div className="lg:col-span-3">
          {isSearching ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card">
                  <div className="animate-pulse flex space-x-4">
                    <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                      <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {filteredResults.map((result, index) => {
                const IconComponent = getResultIcon(result.type);
                return (
                  <motion.div
                    key={result.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="card-interactive group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultBadgeColor(result.type)}`}>
                            {result.type.toUpperCase()}
                          </div>
                          {result.timestamp && (
                            <span className="text-xs text-neutral-500">
                              {new Date(result.timestamp * 1000).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors">
                          {result.title}
                        </h3>
                        
                        <p className="text-neutral-600 mb-3">
                          {result.description}
                        </p>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <span className="text-neutral-500 capitalize">{key}:</span>
                              <span className="font-medium text-neutral-900 truncate">
                                {typeof value === 'string' && value.startsWith('0x') 
                                  ? `${value.slice(0, 6)}...${value.slice(-4)}`
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                        >
                          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : searchQuery ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center py-16"
            >
              <MagnifyingGlassIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No Results Found
              </h3>
              <p className="text-neutral-500 mb-6">
                Try adjusting your search terms or filters.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center py-16"
            >
              <MagnifyingGlassIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                Start Exploring
              </h3>
              <p className="text-neutral-500 mb-6">
                Enter a search query to explore the Aura Lend protocol.
              </p>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Searches */}
          {searchHistory && searchHistory.length > 0 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="w-full text-left p-2 rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Protocol Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total NFTs</span>
                <span className="font-semibold text-neutral-900">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Active Loans</span>
                <span className="font-semibold text-neutral-900">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Live Auctions</span>
                <span className="font-semibold text-neutral-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Users</span>
                <span className="font-semibold text-neutral-900">3,456</span>
              </div>
            </div>
          </motion.div>

          {/* Search Tips */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="card bg-primary-50 border-primary-200"
          >
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Search Tips</h3>
            <div className="space-y-3 text-sm text-primary-800">
              <div>
                <strong>NFT ID:</strong> Use # prefix (e.g., #123)
              </div>
              <div>
                <strong>Loan ID:</strong> Enter loan ID number
              </div>
              <div>
                <strong>Address:</strong> Full or partial wallet address
              </div>
              <div>
                <strong>Transaction:</strong> Transaction hash
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
