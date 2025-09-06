// Petra Wallet Connection Diagnostic Script
// Open browser console and run: window.debugPetraWallet()

window.debugPetraWallet = async function() {
  console.log('🔧 Starting Petra Wallet Debug...');
  
  // Step 1: Check if window.aptos exists
  console.log('1️⃣ Checking window.aptos:', !!window.aptos);
  if (!window.aptos) {
    console.error('❌ window.aptos not found. Is Petra wallet installed?');
    return;
  }
  
  // Step 2: Check wallet methods
  const petra = window.aptos;
  console.log('2️⃣ Available methods:', Object.keys(petra));
  
  // Step 3: Try connection methods
  try {
    console.log('3️⃣ Testing connection...');
    
    // Method 1: Check if connected
    try {
      const isConnected = await petra.isConnected();
      console.log('   isConnected():', isConnected);
    } catch (e) {
      console.log('   isConnected() error:', e.message);
    }
    
    // Method 2: Try to get account directly
    try {
      const account = await petra.account();
      console.log('   account():', account);
      
      if (account?.address) {
        console.log('✅ Wallet connected successfully!');
        console.log('   Address:', account.address);
        
        // Method 3: Test network
        try {
          const network = await petra.network();
          console.log('   network():', network);
        } catch (netError) {
          console.log('   network() error:', netError.message);
        }
        
        // Method 4: Test transaction capability
        console.log('4️⃣ Testing transaction signing...');
        try {
          const testPayload = {
            type: "entry_function_payload",
            function: "0x1::coin::transfer",
            type_arguments: ["0x1::aptos_coin::AptosCoin"],
            arguments: [account.address, "1"]
          };
          
          // Don't actually sign, just test the method exists
          console.log('   Transaction payload ready:', testPayload);
          console.log('   signAndSubmitTransaction method exists:', typeof petra.signAndSubmitTransaction);
        } catch (txError) {
          console.log('   Transaction test error:', txError.message);
        }
        
      } else {
        console.log('⚠️ Account exists but no address found');
      }
      
    } catch (accountError) {
      console.log('❌ account() error:', accountError.message);
      
      // Try to connect first
      console.log('   Attempting to connect...');
      try {
        await petra.connect();
        console.log('   Connect successful, trying account() again...');
        const account = await petra.account();
        console.log('   account() after connect:', account);
      } catch (connectError) {
        console.log('   connect() error:', connectError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
  
  console.log('🔧 Debug complete!');
};

console.log('🔧 Petra Wallet Debugger loaded! Run: window.debugPetraWallet()');
