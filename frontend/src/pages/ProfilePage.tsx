import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useUserProfile, useUserLoans, useUserNFTs } from '@/hooks/useLoansData';
import { useAptosWallet } from '@/hooks/useAptosWallet';

type TabType = 'overview' | 'nfts' | 'loans' | 'activity' | 'settings';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { account, connected } = useAptosWallet();
  const { data: profile, isLoading: profileLoading } = useUserProfile(account);
  const { data: userLoans, isLoading: loansLoading } = useUserLoans(account);
  const { data: userNFTs, isLoading: nftsLoading } = useUserNFTs(account);

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <UserCircleIcon className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Connect Your Wallet</h2>
          <p className="text-neutral-600 mb-8">
            Please connect your wallet to view your profile and activity.
          </p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: ChartBarIcon },
    { key: 'nfts', label: 'My NFTs', icon: DocumentTextIcon },
    { key: 'loans', label: 'Loans', icon: CurrencyDollarIcon },
    { key: 'activity', label: 'Activity', icon: ClockIcon },
    { key: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {profile?.username?.[0]?.toUpperCase() || account?.slice(2, 4)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {profile?.username || 'Anonymous User'}
              </h1>
              <p className="text-neutral-600 font-mono text-sm">
                {account && `${account.slice(0, 6)}...${account.slice(-4)}`}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <TrophyIcon className="h-4 w-4 text-warning-600" />
                  <span className="text-sm font-medium text-neutral-900">
                    Rep: {profile?.reputation || 0}
                  </span>
                </div>
                <div className="text-sm text-neutral-600">
                  Member since {new Date(profile?.joinDate || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-neutral-600">Total Portfolio</div>
              <div className="text-2xl font-bold text-neutral-900">
                {profile?.totalPortfolioValue || 0} APT
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 mb-8 bg-neutral-100 p-1 rounded-xl overflow-x-auto"
      >
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabType)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
              activeTab === key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-neutral-900">
                  {userNFTs?.length || 0}
                </div>
                <div className="text-sm text-neutral-600">Property NFTs</div>
              </div>

              <div className="card text-center">
                <CurrencyDollarIcon className="h-8 w-8 text-success-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-neutral-900">
                  {userLoans?.active?.length || 0}
                </div>
                <div className="text-sm text-neutral-600">Active Loans</div>
              </div>

              <div className="card text-center">
                <ClockIcon className="h-8 w-8 text-warning-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-neutral-900">
                  {userLoans?.completed?.length || 0}
                </div>
                <div className="text-sm text-neutral-600">Completed Loans</div>
              </div>

              <div className="card text-center">
                <TrophyIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-neutral-900">
                  {profile?.reputation || 0}
                </div>
                <div className="text-sm text-neutral-600">Reputation Score</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
                <button className="btn-ghost">
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>

              <div className="space-y-4">
                {profile?.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'mint' ? 'bg-primary-100 text-primary-600' :
                      activity.type === 'loan' ? 'bg-success-100 text-success-600' :
                      'bg-warning-100 text-warning-600'
                    }`}>
                      {activity.type === 'mint' && <DocumentTextIcon className="h-5 w-5" />}
                      {activity.type === 'loan' && <CurrencyDollarIcon className="h-5 w-5" />}
                      {activity.type === 'auction' && <ClockIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{activity.title}</h3>
                      <p className="text-sm text-neutral-600">{activity.description}</p>
                      <div className="text-xs text-neutral-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-neutral-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'nfts' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">My Property NFTs</h2>
              <div className="text-sm text-neutral-600">
                {userNFTs?.length || 0} NFT{(userNFTs?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            {nftsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="animate-pulse space-y-4">
                      <div className="aspect-square bg-neutral-200 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userNFTs && userNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNFTs.map((nft: any, index: number) => (
                  <motion.div
                    key={nft.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="card-interactive"
                  >
                    <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
                          #{nft.id}
                        </div>
                        <p className="text-sm text-neutral-600">Property NFT</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{nft.title || `Property #${nft.id}`}</h3>
                        <p className="text-sm text-neutral-600">{nft.location || 'Location not specified'}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Value</span>
                        <span className="font-medium text-neutral-900">{nft.attestedValue || 0} APT</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Status</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          nft.status === 'available' 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-warning-100 text-warning-800'
                        }`}>
                          {nft.status === 'available' ? 'Available' : 'In Use'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <DocumentTextIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">No NFTs Yet</h3>
                <p className="text-neutral-500">You haven't minted any Property NFTs yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'loans' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Loans */}
              <div className="card">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Active Loans</h3>
                <div className="space-y-3">
                  {userLoans?.active?.map((loan: any, index: number) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900">Loan #{loan.id}</div>
                        <div className="text-sm text-neutral-600">{loan.amount} APT</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-neutral-600">{loan.daysLeft} days left</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-neutral-500 text-sm">
                      No active loans
                    </div>
                  )}
                </div>
              </div>

              {/* Loan History */}
              <div className="card">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Loan History</h3>
                <div className="space-y-3">
                  {userLoans?.completed?.map((loan: any, index: number) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900">Loan #{loan.id}</div>
                        <div className="text-sm text-neutral-600">{loan.amount} APT</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {loan.status === 'completed' ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {loan.status === 'completed' ? 'Completed' : 'Defaulted'}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-neutral-500 text-sm">
                      No loan history
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Activity Timeline</h2>
              <div className="space-y-4">
                {profile?.allActivity?.map((activity: any, index: number) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'mint' ? 'bg-primary-100 text-primary-600' :
                        activity.type === 'loan' ? 'bg-success-100 text-success-600' :
                        activity.type === 'repay' ? 'bg-success-100 text-success-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {activity.type === 'mint' && <DocumentTextIcon className="h-5 w-5" />}
                        {activity.type === 'loan' && <CurrencyDollarIcon className="h-5 w-5" />}
                        {activity.type === 'repay' && <CheckCircleIcon className="h-5 w-5" />}
                        {activity.type === 'default' && <XCircleIcon className="h-5 w-5" />}
                      </div>
                      {index !== (profile.allActivity.length - 1) && (
                        <div className="absolute top-10 left-5 w-0.5 h-8 bg-neutral-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-neutral-900">{activity.title}</h3>
                        <span className="text-sm text-neutral-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
                      {activity.txHash && (
                        <button className="text-xs text-primary-600 hover:text-primary-700 mt-2">
                          View Transaction
                        </button>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-neutral-500">
                    No activity to show
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={profile?.username || ''}
                    className="input w-full max-w-md"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Notifications
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="checkbox mr-3" defaultChecked />
                      <span className="text-sm text-neutral-700">Loan status updates</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="checkbox mr-3" defaultChecked />
                      <span className="text-sm text-neutral-700">Auction notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="checkbox mr-3" />
                      <span className="text-sm text-neutral-700">Weekly summary</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="btn-primary">Save Settings</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
