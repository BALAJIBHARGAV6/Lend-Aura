// Simple diagnostic script to test wallet and minting
console.log('🔍 Starting wallet diagnostics...');

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  
  // Test 1: Check if Petra wallet is available
  console.log('1️⃣ Checking Petra wallet availability...');
  const petra = window.aptos;
  if (petra) {
    console.log('✅ Petra wallet found:', !!petra);
  } else {
    console.log('❌ Petra wallet NOT found');
    console.log('Available on window:', Object.keys(window).filter(k => k.includes('aptos') || k.includes('petra')));
  }
  
  // Test 2: Check wallet connection
  if (petra) {
    petra.isConnected().then(isConnected => {
      console.log('2️⃣ Wallet connection status:', isConnected);
      
      if (isConnected) {
        // Test 3: Get account info
        petra.account().then(account => {
          console.log('3️⃣ Account info:', {
            address: account?.address,
            publicKey: account?.publicKey?.slice(0, 10) + '...'
          });
          
          // Test 4: Get network
          petra.network().then(network => {
            console.log('4️⃣ Network info:', network);
            
            // Test 5: Check if we can access the smart contract client
            if (window.auraLendClient) {
              console.log('5️⃣ AuraLend client available:', !!window.auraLendClient);
              
              // Test wallet connection function
              window.auraLendClient.testWalletConnection().then(result => {
                console.log('6️⃣ Test wallet connection result:', result);
              });
              
            } else {
              console.log('❌ AuraLend client not found on window object');
            }
          });
        });
      } else {
        console.log('❌ Wallet not connected. Please connect through Petra extension.');
      }
    }).catch(err => {
      console.log('❌ Error checking connection:', err);
    });
  }
  
} else {
  console.log('❌ Not in browser environment');
}

console.log('🔍 Diagnostics complete. Check console for results.');
