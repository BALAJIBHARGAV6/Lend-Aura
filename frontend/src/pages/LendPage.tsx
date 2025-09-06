import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HandRaisedIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useLoansData, useLoanRequestsWithDetails } from '@/hooks/useLoansData';
import { useAptosWallet } from '@/hooks/useAptosWallet';
import { auraLendClient } from '@/utils/aptos';

export default function LendPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  const { activeLoanRequests, loanRequestsLoading } = useLoansData();
  const { data: loanRequestsWithDetails } = useLoanRequestsWithDetails(activeLoanRequests || []);
  const { connected, fundLoan, isFundingLoan } = useAptosWallet();

  const handleFundLoan = (loanId: number, borrowerAddress: string) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    fundLoan({ loanId, borrowerAddress });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Lending Marketplace
            </h1>
            <p className="text-lg text-neutral-600">
              Fund loan requests and earn competitive interest rates on your APT.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search loan requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-64"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-40"
            >
              <option value="newest">Newest</option>
              <option value="amount">Amount</option>
              <option value="rate">Interest Rate</option>
              <option value="duration">Duration</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="input-field w-32"
            >
              <option value="all">All</option>
              <option value="high-rate">High Rate</option>
              <option value="short-term">Short Term</option>
              <option value="large">Large Amount</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
      >
        <div className="card text-center">
          <ChartBarIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-neutral-900">
            {activeLoanRequests?.length || 0}
          </div>
          <div className="text-sm text-neutral-600">Active Requests</div>
        </div>

        <div className="card text-center">
          <HandRaisedIcon className="h-8 w-8 text-success-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-neutral-900">8.5%</div>
          <div className="text-sm text-neutral-600">Avg. Interest Rate</div>
        </div>

        <div className="card text-center">
          <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-warning-600 font-bold text-sm">30d</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">22</div>
          <div className="text-sm text-neutral-600">Avg. Duration (days)</div>
        </div>
      </motion.div>

      {/* Loan Requests Grid */}
      {loanRequestsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : loanRequestsWithDetails && loanRequestsWithDetails.length > 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loanRequestsWithDetails.map((request, index) => (
            <motion.div
              key={request.loanId}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="card-interactive"
            >
              {/* NFT Preview */}
              <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-neutral-400">
                  <div className="w-16 h-16 bg-neutral-300 rounded-lg flex items-center justify-center">
                    NFT #{request.nftId}
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">Loan Amount</span>
                  <span className="text-lg font-bold text-neutral-900">
                    {request.amount} APT
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">Interest Rate</span>
                  <span className="badge badge-primary">
                    {request.interestRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">Duration</span>
                  <span className="text-sm text-neutral-700">
                    {request.duration} days
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">Borrower</span>
                  <span className="text-sm font-mono text-neutral-700">
                    {request.borrower.slice(0, 6)}...{request.borrower.slice(-4)}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-600">
                      Potential Return
                    </span>
                    <span className="text-lg font-bold text-success-600">
                      {(request.amount * (1 + request.interestRate / 100)).toFixed(2)} APT
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFundLoan(request.loanId, request.borrower)}
                  disabled={!connected || isFundingLoan}
                  className="btn-primary w-full"
                >
                  {!connected 
                    ? 'Connect Wallet' 
                    : isFundingLoan 
                      ? 'Funding...' 
                      : 'Fund Loan'
                  }
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-16"
        >
          <HandRaisedIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">
            No Loan Requests Available
          </h3>
          <p className="text-neutral-500 mb-6">
            There are currently no active loan requests to fund. Check back later!
          </p>
        </motion.div>
      )}

      {/* Connected Wallet Notice */}
      {!connected && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 card bg-primary-50 border-primary-200"
        >
          <div className="text-center">
            <HandRaisedIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-800 mb-2">
              Connect Your Wallet to Start Lending
            </h3>
            <p className="text-primary-600 mb-4">
              Connect your Petra wallet to view and fund loan requests.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
