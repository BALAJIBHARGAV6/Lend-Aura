import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-primary-50">
      {/* Test Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span>Powered by Aptos Move Smart Contracts</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight">
              Unlock Your{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Digital Assets
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-neutral-600 leading-relaxed">
              The premier NFT-backed lending protocol on Aptos. Lend your APT to earn yield,
              or borrow against your Property NFTs with transparent, decentralized finance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <Link
                to="/borrow"
                className="btn-primary px-8 py-4 text-lg font-semibold"
              >
                Start Borrowing
              </Link>
              <Link
                to="/lend"
                className="btn-secondary px-8 py-4 text-lg font-semibold"
              >
                Become a Lender
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Total Volume', value: '$2.1M', change: '+12%' },
              { name: 'Active Loans', value: '156', change: '+8%' },
              { name: 'Success Rate', value: '94%', change: '+2%' },
              { name: 'Total Users', value: '1.2K', change: '+15%' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-neutral-900">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-neutral-600 mt-2">
                  {stat.name}
                </div>
                <div className="text-sm text-success-600 font-medium">
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Aura Lend?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-neutral-600">
              Experience the future of DeFi lending with our innovative platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure Collateral',
                description: 'Your Property NFTs are safely held in smart contracts with multi-signature security.',
              },
              {
                title: 'Competitive Rates',
                description: 'Market-driven interest rates ensure fair pricing for both borrowers and lenders.',
              },
              {
                title: 'Transparent Auctions',
                description: 'Defaulted collateral is auctioned transparently with full on-chain settlement.',
              },
            ].map((feature, index) => (
              <div key={index} className="card text-center">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
