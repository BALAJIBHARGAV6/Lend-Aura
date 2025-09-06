#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Aura Lend Deployment Script ===${NC}"
echo -e "${YELLOW}This script will deploy the Aura Lend smart contracts to Aptos${NC}"
echo ""

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo -e "${RED}Error: Aptos CLI is not installed${NC}"
    echo "Please install the Aptos CLI first:"
    echo "https://aptos.dev/tools/aptos-cli/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "Move.toml" ]; then
    echo -e "${RED}Error: Move.toml not found${NC}"
    echo "Please run this script from the backend directory containing Move.toml"
    exit 1
fi

# Get network choice
echo -e "${BLUE}Select deployment network:${NC}"
echo "1) testnet"
echo "2) mainnet"
echo "3) devnet"
read -p "Enter your choice (1-3): " network_choice

case $network_choice in
    1)
        NETWORK="testnet"
        ;;
    2)
        NETWORK="mainnet"
        echo -e "${YELLOW}Warning: You are deploying to mainnet. This will use real APT tokens.${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    3)
        NETWORK="devnet"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Selected network: $NETWORK${NC}"

# Check if profile exists
PROFILE_NAME="aura-lend-$NETWORK"
if ! aptos config show-profiles | grep -q "$PROFILE_NAME"; then
    echo -e "${YELLOW}Profile $PROFILE_NAME not found. Creating new profile...${NC}"
    
    # Generate new account
    aptos init --profile $PROFILE_NAME --network $NETWORK
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create profile. Exiting.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Using existing profile: $PROFILE_NAME${NC}"
fi

# Get account address
ACCOUNT_ADDRESS=$(aptos config show-profiles --profile $PROFILE_NAME | grep "account" | sed 's/.*: //')
echo -e "${GREEN}Account address: $ACCOUNT_ADDRESS${NC}"

# Fund account if on testnet or devnet
if [[ "$NETWORK" == "testnet" || "$NETWORK" == "devnet" ]]; then
    echo -e "${YELLOW}Funding account with test tokens...${NC}"
    aptos account fund-with-faucet --profile $PROFILE_NAME --account $ACCOUNT_ADDRESS
    
    # Wait a moment for funding to complete
    sleep 3
    
    # Check balance
    BALANCE=$(aptos account balance --profile $PROFILE_NAME --account $ACCOUNT_ADDRESS 2>/dev/null | grep "Balance:" | sed 's/.*: //')
    echo -e "${GREEN}Account balance: $BALANCE APT${NC}"
fi

# Update Move.toml with correct address
echo -e "${YELLOW}Updating Move.toml with account address...${NC}"
sed -i.bak "s/aura_lend = \"_\"$/aura_lend = \"$ACCOUNT_ADDRESS\"/" Move.toml

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Move.toml updated successfully${NC}"
    rm Move.toml.bak
else
    echo -e "${RED}Failed to update Move.toml${NC}"
    exit 1
fi

# Compile the contracts
echo -e "${YELLOW}Compiling Move contracts...${NC}"
aptos move compile --profile $PROFILE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Compilation failed. Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Compilation successful!${NC}"

# Deploy the contracts
echo -e "${YELLOW}Deploying contracts to $NETWORK...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"

aptos move publish --profile $PROFILE_NAME --assume-yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== Deployment Successful! ===${NC}"
    echo ""
    echo -e "${GREEN}Contract deployed to: $ACCOUNT_ADDRESS${NC}"
    echo -e "${GREEN}Network: $NETWORK${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update your frontend configuration with the contract address:"
    echo "   - Update VITE_CONTRACT_ADDRESS in .env"
    echo "   - Set VITE_CONTRACT_ADDRESS=$ACCOUNT_ADDRESS"
    echo ""
    echo "2. Test the deployment:"
    echo "   - Run the frontend application"
    echo "   - Connect your wallet"
    echo "   - Try minting a Property NFT"
    echo ""
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    
    # Save deployment info
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DEPLOY_INFO_FILE="deployment_${NETWORK}_${TIMESTAMP}.json"
    
    cat > $DEPLOY_INFO_FILE << EOF
{
  "network": "$NETWORK",
  "contract_address": "$ACCOUNT_ADDRESS",
  "profile": "$PROFILE_NAME",
  "deployment_time": "$(date)",
  "modules": [
    "${ACCOUNT_ADDRESS}::events",
    "${ACCOUNT_ADDRESS}::property_nft",
    "${ACCOUNT_ADDRESS}::registry", 
    "${ACCOUNT_ADDRESS}::loan_vault",
    "${ACCOUNT_ADDRESS}::auction_house"
  ]
}
EOF
    
    echo -e "${GREEN}Deployment info saved to: $DEPLOY_INFO_FILE${NC}"
    
else
    echo -e "${RED}Deployment failed!${NC}"
    echo "Common issues:"
    echo "1. Insufficient balance - fund your account"
    echo "2. Network issues - check your internet connection"
    echo "3. Contract already exists - use a different address"
    echo ""
    echo "Check the error message above for specific details."
    exit 1
fi
