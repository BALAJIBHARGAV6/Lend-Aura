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
# Lend-Aura
