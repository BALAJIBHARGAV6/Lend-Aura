import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  DocumentTextIcon,
  CameraIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useAptosWallet } from '@/hooks/useAptosWallet';

export default function BorrowPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    propertyValue: '',
    propertyLocation: '',
    documentHash: '',
    metadataUri: '',
    loanAmount: '',
    interestRate: '',
    duration: '30',
  });

  const { connected, account, mintNFT, createLoan, isMintingNFT, isCreatingLoan, userProperties } = useAptosWallet();

  const handleMintNFT = async () => {
    if (!connected) return;

    try {
      await mintNFT({
        valuationHash: formData.documentHash || 'QmExampleHash123',
        metadataUri: formData.metadataUri || 'https://ipfs.io/ipfs/QmExample',
      });
      setStep(2);
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
  };

  const handleCreateLoan = async () => {
    if (!connected || !userProperties?.length) return;

    try {
      await createLoan({
        nftId: userProperties[userProperties.length - 1], // Use the latest NFT
        nftOwner: account || '', // Use the account address as NFT owner
        amount: parseFloat(formData.loanAmount),
        interestRate: parseFloat(formData.interestRate),
        duration: parseInt(formData.duration) * 24 * 60 * 60, // Convert days to seconds
      });
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <BanknotesIcon className="h-16 w-16 text-primary-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Connect Your Wallet to Borrow
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          You need to connect your Petra wallet to mint Property NFTs and create loan requests.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              1
            </div>
            <span className="ml-3 text-sm font-medium text-neutral-700">Mint Property NFT</span>
          </div>
          
          <div className="flex-1 mx-4 h-px bg-neutral-200" />
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              2
            </div>
            <span className="ml-3 text-sm font-medium text-neutral-700">Create Loan Request</span>
          </div>
        </div>
      </div>

      {/* Step 1: Mint Property NFT */}
      {step === 1 && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Mint Your Property NFT
            </h1>
            <p className="text-lg text-neutral-600">
              Create a digital representation of your property as collateral for your loan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                Property Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select property type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Estimated Value (APT)
                  </label>
                  <input
                    type="number"
                    value={formData.propertyValue}
                    onChange={(e) => setFormData({ ...formData, propertyValue: e.target.value })}
                    placeholder="e.g., 1000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.propertyLocation}
                    onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                    placeholder="e.g., New York, NY"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Valuation Document Hash
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.documentHash}
                      onChange={(e) => setFormData({ ...formData, documentHash: e.target.value })}
                      placeholder="IPFS hash of valuation document"
                      className="input-field flex-1"
                    />
                    <button className="btn-secondary px-4">
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Upload your property valuation to IPFS and enter the hash here.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Metadata URI
                  </label>
                  <input
                    type="url"
                    value={formData.metadataUri}
                    onChange={(e) => setFormData({ ...formData, metadataUri: e.target.value })}
                    placeholder="https://ipfs.io/ipfs/QmExample..."
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMintNFT}
                  disabled={isMintingNFT || !formData.propertyType}
                  className="btn-primary w-full"
                >
                  {isMintingNFT ? (
                    <>
                      <div className="spinner mr-2" />
                      Minting NFT...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Mint Property NFT
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Preview */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                NFT Preview
              </h3>
              
              <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl mb-6 flex items-center justify-center">
                <div className="text-center">
                  <CameraIcon className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                  <p className="text-primary-600 font-medium">Property NFT</p>
                  <p className="text-sm text-primary-500">
                    {formData.propertyType || 'Property Type'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Type</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {formData.propertyType || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Value</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {formData.propertyValue ? `${formData.propertyValue} APT` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Location</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {formData.propertyLocation || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Create Loan Request */}
      {step === 2 && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Create Loan Request
            </h1>
            <p className="text-lg text-neutral-600">
              Set your loan terms and submit your request to the marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Loan Form */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                Loan Terms
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Loan Amount (APT)
                  </label>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                    placeholder="e.g., 500"
                    className="input-field"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Maximum: 70% of property value
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="e.g., 8.5"
                    step="0.1"
                    className="input-field"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Current market rate: 8.5% - 12%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Loan Duration (Days)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Total Repayment
                    </span>
                    <span className="text-lg font-bold text-neutral-900">
                      {formData.loanAmount && formData.interestRate
                        ? (parseFloat(formData.loanAmount) * (1 + parseFloat(formData.interestRate) / 100)).toFixed(2)
                        : '0.00'
                      } APT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Interest</span>
                    <span className="text-sm font-medium text-neutral-700">
                      {formData.loanAmount && formData.interestRate
                        ? (parseFloat(formData.loanAmount) * parseFloat(formData.interestRate) / 100).toFixed(2)
                        : '0.00'
                      } APT
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateLoan}
                  disabled={isCreatingLoan || !formData.loanAmount || !formData.interestRate}
                  className="btn-primary w-full"
                >
                  {isCreatingLoan ? (
                    <>
                      <div className="spinner mr-2" />
                      Creating Loan...
                    </>
                  ) : (
                    <>
                      <BanknotesIcon className="h-5 w-5 mr-2" />
                      Create Loan Request
                    </>
                  )}
                </motion.button>

                <button
                  onClick={() => setStep(1)}
                  className="btn-ghost w-full"
                >
                  Back to NFT Creation
                </button>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                Loan Summary
              </h3>
              
              <div className="space-y-6">
                {/* Collateral */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Collateral</h4>
                  <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <CameraIcon className="h-10 w-10 text-primary-400 mx-auto mb-2" />
                      <p className="text-sm text-primary-600 font-medium">Property NFT</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Type</span>
                      <span className="font-medium">{formData.propertyType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Value</span>
                      <span className="font-medium">{formData.propertyValue} APT</span>
                    </div>
                  </div>
                </div>

                {/* Loan Terms Summary */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Loan Terms</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Amount</span>
                      <span className="text-sm font-medium">{formData.loanAmount || '0'} APT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Interest Rate</span>
                      <span className="text-sm font-medium">{formData.interestRate || '0'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Duration</span>
                      <span className="text-sm font-medium">{formData.duration} days</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-neutral-200">
                      <span className="text-sm font-medium text-neutral-700">Total Repayment</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formData.loanAmount && formData.interestRate
                          ? (parseFloat(formData.loanAmount) * (1 + parseFloat(formData.interestRate) / 100)).toFixed(2)
                          : '0.00'
                        } APT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Warning */}
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-warning-800 mb-2">
                    Important Notice
                  </h4>
                  <p className="text-xs text-warning-700">
                    If you fail to repay the loan by the due date, your Property NFT collateral 
                    will be automatically auctioned to recover the loan amount.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
