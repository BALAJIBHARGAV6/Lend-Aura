import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MegaphoneIcon, 
  ClockIcon, 
  FireIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuctionsData, useAuctionsWithDetails, useCountdown } from '@/hooks/useLoansData';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { auraLendClient } from '@/utils/aptos';

interface CountdownTimerProps {
  endTime: number;
}

function CountdownTimer({ endTime }: CountdownTimerProps) {
  const { timeRemaining } = useCountdown(endTime);

  if (timeRemaining.isExpired) {
    return <span className="text-red-600 font-semibold">Auction Ended</span>;
  }

  return (
    <div className="flex items-center space-x-1 text-sm font-mono">
      <ClockIcon className="h-4 w-4" />
      <span>
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {String(timeRemaining.hours).padStart(2, '0')}:
        {String(timeRemaining.minutes).padStart(2, '0')}:
        {String(timeRemaining.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function AuctionsPage() {
  const { activeAuctions, auctionsLoading } = useAuctionsData();
  // Convert auction IDs to the format expected by useAuctionsWithDetails
  const auctionsForDetails = (activeAuctions || []).map(auctionId => ({ 
    auctionId, 
    needsDetails: true 
  }));
  const { data: auctionsWithDetails } = useAuctionsWithDetails(auctionsForDetails);
  const { connected, account } = useWallet();
  const { showToast } = useToast();
  const [biddingAuction, setBiddingAuction] = useState<number | null>(null);

  const handlePlaceBid = async (auctionId: number, lenderAddress: string, currentBid: number) => {
    if (!connected || !account) {
      showToast('warning', 'Please connect your wallet first');
      return;
    }

    const bidAmount = prompt(`Enter your bid amount (current: ${currentBid} APT):`);
    if (!bidAmount || parseFloat(bidAmount) <= currentBid) {
      showToast('warning', 'Bid must be higher than current bid');
      return;
    }

    try {
      setBiddingAuction(auctionId);
      await auraLendClient.placeBid(account, auctionId, lenderAddress, parseFloat(bidAmount));
      showToast('success', 'Bid placed successfully!');
    } catch (error) {
      console.error('Error placing bid:', error);
      showToast('error', 'Failed to place bid. Please try again.');
    } finally {
      setBiddingAuction(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Live Auctions
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Bid on defaulted collateral NFTs. All auctions are transparent and settled automatically on-chain.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card text-center">
            <MegaphoneIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-neutral-900">
              {activeAuctions?.length || 0}
            </div>
            <div className="text-sm text-neutral-600">Active Auctions</div>
          </div>

          <div className="card text-center">
            <FireIcon className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-neutral-900">156</div>
            <div className="text-sm text-neutral-600">Total Bids Today</div>
          </div>

          <div className="card text-center">
            <UserGroupIcon className="h-8 w-8 text-success-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-neutral-900">89</div>
            <div className="text-sm text-neutral-600">Active Bidders</div>
          </div>
        </div>
      </motion.div>

      {/* Auctions Grid */}
      {auctionsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse space-y-4">
                <div className="aspect-square bg-neutral-200 rounded-xl"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-10 bg-neutral-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : auctionsWithDetails && auctionsWithDetails.length > 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {auctionsWithDetails.map((auction, index) => (
            <motion.div
              key={auction.auctionId}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="card-interactive"
            >
              {/* NFT Preview */}
              <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
                      #{auction.nftId}
                    </div>
                    <p className="text-sm text-neutral-600">Property NFT</p>
                  </div>
                </div>

                {/* Auction Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>
              </div>

              {/* Auction Details */}
              <div className="space-y-4">
                {/* Current Bid */}
                <div className="text-center py-3 bg-primary-50 rounded-xl">
                  <div className="text-sm text-primary-600 font-medium mb-1">Current Bid</div>
                  <div className="text-2xl font-bold text-primary-800">
                    {auction.currentBid} APT
                  </div>
                  <div className="text-xs text-primary-600">
                    {auction.bidCount} bid{auction.bidCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <span className="text-sm font-medium text-neutral-700">Time Left</span>
                  <CountdownTimer endTime={auction.endTime} />
                </div>

                {/* Auction Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Min Bid</span>
                    <span className="font-medium text-neutral-900">{auction.minBid} APT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">NFT ID</span>
                    <span className="font-mono text-neutral-900">#{auction.nftId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Lender</span>
                    <span className="font-mono text-neutral-700">
                      {auction.lender.slice(0, 6)}...{auction.lender.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Bid Button */}
                <div className="pt-4 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlaceBid(auction.auctionId, auction.lender, auction.currentBid)}
                    disabled={!connected || biddingAuction !== null}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      !connected
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : auction.status !== 0
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {!connected ? (
                      'Connect Wallet to Bid'
                    ) : biddingAuction !== null ? (
                      <>
                        <div className="spinner mr-2" />
                        Placing Bid...
                      </>
                    ) : auction.status !== 0 ? (
                      'Auction Ended'
                    ) : (
                      `Place Bid (>${auction.currentBid} APT)`
                    )}
                  </motion.button>

                  {/* Quick Bid Buttons */}
                  {connected && auction.status === 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePlaceBid(auction.auctionId, auction.lender, auction.currentBid)}
                        className="btn-ghost text-xs flex-1 py-2"
                      >
                        +1 APT
                      </button>
                      <button
                        onClick={() => handlePlaceBid(auction.auctionId, auction.lender, auction.currentBid)}
                        className="btn-ghost text-xs flex-1 py-2"
                      >
                        +5 APT
                      </button>
                      <button
                        onClick={() => handlePlaceBid(auction.auctionId, auction.lender, auction.currentBid)}
                        className="btn-ghost text-xs flex-1 py-2"
                      >
                        +10 APT
                      </button>
                    </div>
                  )}
                </div>
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
          <MegaphoneIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">
            No Active Auctions
          </h3>
          <p className="text-neutral-500 mb-6">
            There are currently no auctions running. Auctions start when loans default.
          </p>
        </motion.div>
      )}

      {/* How Auctions Work */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 card bg-secondary-50 border-primary-200"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            How Auctions Work
          </h2>
          <p className="text-neutral-600">
            When a loan defaults, the collateral NFT is automatically put up for auction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Loan Default</h3>
            <p className="text-sm text-neutral-600">
              Borrower fails to repay by due date
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 border border-primary-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MegaphoneIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Auction Start</h3>
            <p className="text-sm text-neutral-600">
              NFT automatically listed for bidding
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-warning-100 border border-warning-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FireIcon className="h-6 w-6 text-warning-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Bidding</h3>
            <p className="text-sm text-neutral-600">
              Users place competitive bids
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-success-100 border border-success-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UserGroupIcon className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Settlement</h3>
            <p className="text-sm text-neutral-600">
              Winner gets NFT, proceeds to lender
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
