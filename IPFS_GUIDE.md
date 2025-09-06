# 📋 **IPFS Guide: Getting Document Hashes & Metadata URIs**

## 🔍 **What You Need**

### **1. Valuation Document Hash**
- **Purpose**: Proves your property's value/ownership
- **Format**: `QmTestPropertyDoc123abcdefghijklmnopqrstuvwxyz456789`
- **Example**: Your form now shows a test placeholder you can use!

### **2. Metadata URI** 
- **Purpose**: NFT metadata (name, description, attributes)
- **Format**: `https://ipfs.io/ipfs/QmTestMetadata456defghijklmnopqrstuvwxyz123abc`
- **Example**: Your form now shows a test placeholder you can use!

---

## 🚀 **Quick Testing (Use Right Now)**

### **For Testing Your App:**
1. **Leave fields empty** → App uses test placeholders automatically
2. **Or copy-paste these test values:**

**Document Hash:**
```
QmTestPropertyDoc123abcdefghijklmnopqrstuvwxyz456789
```

**Metadata URI:**
```
https://ipfs.io/ipfs/QmTestMetadata456defghijklmnopqrstuvwxyz123abc
```

3. **Click "Mint Property NFT"** → Creates real blockchain NFT with test data!

---

## 🌐 **Real IPFS Setup (For Production)**

### **Step 1: Create Property Document**
- Property deed, valuation report, survey document
- Save as PDF, JPG, or PNG

### **Step 2: Upload to IPFS**

#### **Option A: Pinata (Easiest)**
1. Go to [pinata.cloud](https://pinata.cloud)
2. Create free account
3. Click "Upload" → Select your document
4. Get hash like `QmRealDocumentHash123...`

#### **Option B: Web3.Storage**
1. Go to [web3.storage](https://web3.storage)
2. Create account
3. Upload document
4. Get IPFS hash

#### **Option C: IPFS Desktop**
1. Download [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
2. Install and run
3. Add your file
4. Copy the hash

### **Step 3: Create NFT Metadata**
Create a JSON file like this:

```json
{
  "name": "Land Property NFT #1",
  "description": "99999 APT valued land in India",
  "image": "https://ipfs.io/ipfs/QmYourPropertyImageHash...",
  "external_url": "https://your-property-website.com",
  "attributes": [
    {
      "trait_type": "Property Type",
      "value": "Land"
    },
    {
      "trait_type": "Location", 
      "value": "India"
    },
    {
      "trait_type": "Estimated Value",
      "value": "99999 APT"
    },
    {
      "trait_type": "Area",
      "value": "1000 sq ft"
    }
  ]
}
```

### **Step 4: Upload Metadata JSON**
1. Save above as `metadata.json`
2. Upload to IPFS (same platforms as above)
3. Get URI like `https://ipfs.io/ipfs/QmYourMetadataHash...`

---

## 🎯 **What Happens When You Submit**

### **Your Smart Contract Call:**
```typescript
// REAL BLOCKCHAIN TRANSACTION
await auraLendClient.mintPropertyNFT(
  account,                                    // Your wallet
  "QmYourDocumentHash...",                     // Document proof
  "https://ipfs.io/ipfs/QmYourMetadata..."    // NFT metadata
);
```

### **Result:**
- ✅ Real NFT created on Aptos blockchain
- ✅ Your property is now tokenized
- ✅ Can be used as collateral for loans
- ✅ Viewable on blockchain explorers

---

## 🔧 **Current Setup Status**

**✅ Smart Contract**: Live on Aptos Devnet  
**✅ Test Placeholders**: Ready to use  
**✅ Real IPFS**: Optional for production  
**✅ NFT Minting**: Fully functional  

---

## 💡 **Quick Start Options**

### **Option 1: Test Now (Recommended)**
- Use empty fields (auto-fills test data)
- Click "Mint Property NFT"
- Creates real NFT with placeholder data

### **Option 2: Real IPFS**
- Follow IPFS guide above
- Use real document hashes
- Creates production-ready NFT

---

**Your DeFi platform is ready to mint real NFTs! 🚀**
