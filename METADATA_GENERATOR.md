# Easy Metadata Generator

## 🚀 Quick Copy-Paste Solution

Open your browser console (F12) on your DApp and paste this code:

```javascript
// Quick metadata generator function
function generateMetadata(options = {}) {
  const {
    propertyName = "Luxury Property NFT",
    description = "High-value residential property for DeFi collateral",
    propertyType = "Residential",
    location = "Premium District",
    bedrooms = "3",
    bathrooms = "2",
    squareFeet = "1500",
    yearBuilt = "2020",
    imageUrl = "ipfs://QmPropertyImageHash...",
    externalUrl = "https://property-details.com"
  } = options;

  const metadata = {
    "name": propertyName,
    "description": description,
    "image": imageUrl,
    "external_url": externalUrl,
    "attributes": [
      {
        "trait_type": "Property Type",
        "value": propertyType
      },
      {
        "trait_type": "Location",
        "value": location
      },
      {
        "trait_type": "Bedrooms",
        "value": bedrooms
      },
      {
        "trait_type": "Bathrooms",
        "value": bathrooms
      },
      {
        "trait_type": "Square Feet",
        "value": squareFeet
      },
      {
        "trait_type": "Year Built",
        "value": yearBuilt
      }
    ]
  };

  return JSON.stringify(metadata, null, 2);
}

// Generate default metadata
console.log("=== DEFAULT METADATA JSON ===");
console.log(generateMetadata());

// Copy to clipboard function
function copyMetadata(customOptions = {}) {
  const json = generateMetadata(customOptions);
  navigator.clipboard.writeText(json).then(() => {
    console.log("✅ Metadata copied to clipboard!");
  });
  return json;
}
```

## 📋 How to Use:

### 1. Generate Default Metadata:
```javascript
generateMetadata()
```

### 2. Generate Custom Metadata:
```javascript
generateMetadata({
  propertyName: "Modern Villa",
  location: "Beverly Hills",
  bedrooms: "4",
  squareFeet: "2500"
})
```

### 3. Copy to Clipboard:
```javascript
copyMetadata()
```

### 4. Copy Custom to Clipboard:
```javascript
copyMetadata({
  propertyName: "Your Property Name",
  location: "Your Location"
})
```

## 🔥 Super Quick Default JSON (Ready to Copy):

```json
{
  "name": "Luxury Property NFT",
  "description": "High-value residential property for DeFi collateral",
  "image": "ipfs://QmPropertyImageHash...",
  "external_url": "https://property-details.com",
  "attributes": [
    {
      "trait_type": "Property Type",
      "value": "Residential"
    },
    {
      "trait_type": "Location",
      "value": "Premium District"
    },
    {
      "trait_type": "Bedrooms",
      "value": "3"
    },
    {
      "trait_type": "Bathrooms",
      "value": "2"
    },
    {
      "trait_type": "Square Feet",
      "value": "1500"
    },
    {
      "trait_type": "Year Built",
      "value": "2020"
    }
  ]
}
```

## 📝 Steps to Create Metadata URI:

1. **Copy the JSON above** (or generate custom one)
2. **Save as a file** (e.g., `metadata.json`)
3. **Upload to Pinata IPFS**
4. **Get the IPFS hash** (e.g., `QmMetadataHash123...`)
5. **Your Metadata URI**: `ipfs://QmMetadataHash123...`
6. **Paste in the form** Metadata URI field

## ⚡ Even Faster - Use in your React app:

```javascript
// In browser console while on your DApp
const metadata = window.auraLendClient?.generateQuickMetadata();
console.log(metadata);
```

Now you can just copy-paste the output to create your metadata file! 🎉
