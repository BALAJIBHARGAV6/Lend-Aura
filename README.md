# Aura Lend - NFT-Backed Lending Protocol

A decentralized lending platform built on Aptos blockchain, enabling Property NFT-backed loans with automated auction mechanisms for defaulted collateral.

## 🌟 Features

### Core Protocol
- **Property NFT Minting**: Create verifiable property NFTs with attestation
- **P2P Lending**: Direct lending between users with customizable terms
- **Automated Auctions**: Default handling through transparent auction system
- **Reputation System**: Track borrowing history and build trust
- **Event-Driven Architecture**: Complete transparency with on-chain events

### User Interface
- **Modern Web3 Design**: Professional UI with blue/white theme
- **3D Animations**: Interactive Earth animation and smooth transitions
- **Wallet Integration**: Seamless Petra wallet connectivity
- **Real-time Updates**: Live loan status and auction countdowns
- **Mobile Responsive**: Optimized for all device sizes

## 🏗️ Architecture

### Smart Contracts (Move)
```
backend/sources/
├── events.move          # Event definitions and emission
├── property_nft.move    # NFT minting and management
├── registry.move        # User reputation and tracking
├── loan_vault.move      # Lending logic and P2P matching
└── auction_house.move   # Default handling and auctions
```

### Frontend (React + TypeScript)
```
frontend/src/
├── components/         # Reusable UI components
├── pages/             # Main application pages
├── hooks/             # Custom React hooks for blockchain
├── lib/               # Utility functions and configurations
└── styles/            # Tailwind CSS styling
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Aptos CLI
- Petra Wallet browser extension

### Backend Deployment

1. **Install Aptos CLI**
   ```bash
   # Follow official Aptos installation guide
   https://aptos.dev/tools/aptos-cli/
   ```

2. **Deploy Contracts**
   ```bash
   cd backend
   ./deploy.sh
   ```
   
   The script will:
   - Create/use Aptos profile
   - Fund account (testnet/devnet)
   - Compile contracts
   - Deploy to selected network
   - Save deployment info

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Update VITE_CONTRACT_ADDRESS with deployed contract address
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Usage Guide

### For Borrowers

1. **Connect Wallet**: Connect your Petra wallet
2. **Mint Property NFT**: Create a verifiable property NFT
3. **Request Loan**: Set loan terms and collateral
4. **Manage Loans**: Track repayment schedule
5. **Repay Early**: Save on interest with early repayment

### For Lenders

1. **Browse Loans**: Explore available loan requests
2. **Fund Loans**: Provide capital with competitive returns
3. **Track Portfolio**: Monitor active investments
4. **Auction Participation**: Bid on defaulted collateral

### For Auction Participants

1. **View Live Auctions**: Browse defaulted collateral
2. **Place Bids**: Competitive bidding system
3. **Win Assets**: Acquire property NFTs at market rates
4. **Settlement**: Automatic on-chain settlement

## 🛠️ Development

### Project Structure
```
Lend-Aura/
├── backend/                 # Move smart contracts
│   ├── sources/            # Contract source files
│   ├── Move.toml          # Move configuration
│   └── deploy.sh          # Deployment script
├── frontend/               # React application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Dependencies
└── README.md              # This file
```

### Smart Contract Development

**Compilation**
```bash
cd backend
aptos move compile --profile <profile-name>
```

**Testing**
```bash
aptos move test --profile <profile-name>
```

**Local Development**
```bash
# Start local Aptos node
aptos node run-local-testnet --with-faucet
```

### Frontend Development

**Development Server**
```bash
cd frontend
npm run dev
```

**Build for Production**
```bash
npm run build
```

**Type Checking**
```bash
npm run type-check
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```bash
VITE_NETWORK=testnet                    # Aptos network
VITE_CONTRACT_ADDRESS=0x...            # Deployed contract address
VITE_NODE_URL=https://fullnode.testnet.aptoslabs.com
VITE_FAUCET_URL=https://faucet.testnet.aptoslabs.com
```

### Move.toml Configuration
```toml
[package]
name = "aura_lend"
version = "1.0.0"
authors = []

[addresses]
aura_lend = "_"  # Replaced during deployment

[dev-addresses]

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-framework"

[dev-dependencies]
```

## 🔐 Security Features

### Smart Contract Security
- **Access Control**: Function-level permissions
- **Input Validation**: Comprehensive parameter checking
- **Error Handling**: Detailed error codes and messages
- **Event Logging**: Complete audit trail
- **Resource Management**: Safe handling of assets

### Frontend Security
- **Wallet Integration**: Secure transaction signing
- **Input Sanitization**: XSS protection
- **Type Safety**: TypeScript for runtime safety
- **HTTPS Only**: Secure communication
- **CSP Headers**: Content Security Policy

## 🧪 Testing

### Contract Testing
```bash
cd backend
aptos move test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### Integration Testing
```bash
# Deploy to devnet and test full flow
./backend/deploy.sh  # Choose devnet
npm run test:integration
```

## 📈 Monitoring

### Contract Events
- `PropertyMinted`: NFT creation events
- `LoanCreated`: Loan request events  
- `LoanFunded`: Funding events
- `LoanRepaid`: Repayment events
- `AuctionStarted`: Default handling events
- `BidPlaced`: Auction participation events

### Analytics Integration
The platform supports integration with:
- Transaction monitoring
- User behavior analytics
- Performance metrics
- Error tracking

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Development Guidelines
- Follow Move best practices for contracts
- Use TypeScript for type safety
- Follow React hooks patterns
- Write comprehensive tests
- Document all functions
- Follow semantic versioning

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://aura-lend.vercel.app](https://aura-lend.vercel.app)
- **Documentation**: [https://docs.aura-lend.com](https://docs.aura-lend.com)
- **Aptos Explorer**: [https://explorer.aptoslabs.com](https://explorer.aptoslabs.com)
- **Discord Community**: [https://discord.gg/aura-lend](https://discord.gg/aura-lend)

## 📞 Support

For support and questions:
- Create an issue in this repository
- Join our Discord community
- Email: support@aura-lend.com

## 🙏 Acknowledgments

- **Aptos Labs**: For the innovative blockchain platform
- **Move Language**: For secure smart contract development
- **React Community**: For the robust frontend framework
- **Tailwind CSS**: For the beautiful design system
- **Framer Motion**: For smooth animations

---

**Built with ❤️ for the decentralized future**
# 🌟 Lend-Aura

**A Revolutionary DeFi Lending Platform on Aptos Blockchain**

Lend-Aura is a decentralized finance (DeFi) application that enables users to lend and borrow cryptocurrency using NFT collateral. Built on the Aptos blockchain for high performance and low transaction costs.

## ✨ Features

### 🏦 Core Lending Features
- **NFT-Backed Loans**: Use your property NFTs as collateral for loans
- **Competitive Interest Rates**: Earn attractive yields by lending APT tokens
- **Automated Liquidation**: Smart contract-powered auction system for defaulted loans
- **Real-time Analytics**: Track your portfolio performance and loan metrics

### 🎯 User Experiences
- **For Borrowers**: 
  - Mint property NFTs with verified valuations
  - Create loan requests with custom terms
  - Manage active loans and repayment schedules
  
- **For Lenders**: 
  - Browse and fund loan opportunities
  - Diversify lending portfolio across multiple borrowers
  - Participate in liquidation auctions

### 🔧 Technical Features
- **Aptos Integration**: Built on high-performance Aptos blockchain
- **Petra Wallet Support**: Seamless wallet connection and transaction signing
- **Modern UI/UX**: Beautiful, responsive interface built with React + Tailwind CSS
- **Real-time Updates**: Live data synchronization with blockchain state

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for beautiful styling
- **Framer Motion** for smooth animations
- **TanStack Query** for efficient data fetching

### Blockchain Integration
- **Aptos Move Contracts** for core lending logic
- **@aptos-labs/ts-sdk** for blockchain interaction
- **Petra Wallet** integration for user authentication

### Smart Contracts
- **Property NFT Module**: Handle property tokenization
- **Loan Vault Module**: Manage loan lifecycle
- **Auction House Module**: Automate liquidation process
- **Registry Module**: Track borrower reputation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Petra Wallet browser extension

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/BALAJIBHARGAV6/Lend-Aura.git
cd Lend-Aura
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🌐 Live Demo

- **Frontend**: [Visit Lend-Aura](http://localhost:3000) (when running locally)
- **Smart Contracts**: Deployed on Aptos Devnet
- **Contract Address**: `0x593c05afb0b61418fd5c87aa150f57ed70eb4761fe555645f4822cb374ddae0f`

## 📱 Pages & Features

### 🏠 Dashboard
- Platform overview and statistics
- Your lending/borrowing activity
- Quick access to main features

### 💰 Lend Page
- Browse active loan requests
- Filter by interest rate, duration, amount
- Fund promising opportunities

### 🏦 Borrow Page
- Mint property NFTs
- Create loan requests
- Manage your active loans

### 📊 Portfolio Page
- Track your investments
- View loan history and performance
- Monitor reputation score

### ⚡ Auctions Page
- Participate in liquidation auctions
- Bid on defaulted collateral
- Track auction results

## 🔧 Technical Details

### Smart Contract Functions
- `mint_property_nft()` - Create property NFTs
- `create_loan_request()` - Request loans using NFT collateral
- `fund_loan()` - Lend APT to borrowers
- `repay_loan()` - Repay loans with interest
- `place_bid()` - Bid in liquidation auctions

### Key Technologies
- **TypeScript**: End-to-end type safety
- **React Query**: Efficient data synchronization
- **Tailwind CSS**: Utility-first styling
- **Aptos Move**: High-performance smart contracts

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/BALAJIBHARGAV6/Lend-Aura/issues)
- **Discussions**: [GitHub Discussions](https://github.com/BALAJIBHARGAV6/Lend-Aura/discussions)

## 🎉 Acknowledgments

- Aptos Foundation for the amazing blockchain infrastructure
- Petra Wallet team for the excellent wallet integration
- The DeFi community for inspiration and feedback

---

**Built with ❤️ on Aptos blockchain**

*Revolutionizing decentralized lending, one transaction at a time.*
