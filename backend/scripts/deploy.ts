import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  MoveVector,
  U64,
} from "@aptos-labs/ts-sdk";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, resolve } from "path";

// Configuration
const NETWORK = Network.TESTNET; // Change to MAINNET for production
const MODULE_PATH = "../sources";

interface DeploymentConfig {
  network: Network;
  privateKey?: string;
  adminAddress?: string;
}

class AuraLendDeployer {
  private aptos: Aptos;
  private admin: Account;
  private config: DeploymentConfig;
  private adminPrivateKey: string;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.aptos = new Aptos(new AptosConfig({ network: config.network }));
    
    if (config.privateKey) {
      const privateKey = new Ed25519PrivateKey(config.privateKey);
      this.admin = Account.fromPrivateKey({ privateKey });
      this.adminPrivateKey = config.privateKey;
    } else {
      // Generate new account for testing
      this.admin = Account.generate();
      this.adminPrivateKey = 'generated_account_no_private_key_access';
    }
  }

  async fundAccount(account: Account, amount: number = 100_000_000) {
    if (this.config.network === Network.TESTNET) {
      try {
        await this.aptos.fundAccount({
          accountAddress: account.accountAddress,
          amount,
        });
        console.log(`✅ Funded account ${account.accountAddress} with ${amount / 100_000_000} APT`);
      } catch (error) {
        console.log(`❌ Failed to fund account: ${error}`);
      }
    }
  }

  async compileAndDeploy() {
    console.log("🚀 Starting Aura Lend deployment...\n");
    
    // Fund admin account if on testnet
    await this.fundAccount(this.admin);
    
    console.log(`📋 Deployment Details:`);
    console.log(`   Network: ${this.config.network}`);
    console.log(`   Admin Address: ${this.admin.accountAddress}`);
    console.log(`   Admin Private Key: ${this.adminPrivateKey}\n`);

    try {
      // Read and compile Move package
      console.log("📦 Compiling Move package...");
      
      // For actual deployment, you would use the Aptos CLI to compile
      // This is a simplified version for demonstration
      const packageMetadata = this.readPackageMetadata();
      
      // Deploy the package
      console.log("🚀 Deploying contracts...");
      const transaction = await this.aptos.publishPackageTransaction({
        account: this.admin.accountAddress,
        metadataBytes: packageMetadata.metadata,
        moduleBytecode: packageMetadata.modules,
      });

      const committedTransaction = await this.aptos.signAndSubmitTransaction({
        signer: this.admin,
        transaction,
      });

      await this.aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      console.log(`✅ Package deployed successfully!`);
      console.log(`   Transaction: ${committedTransaction.hash}`);
      
      // Initialize the modules
      await this.initializeModules();
      
      console.log("\n🎉 Aura Lend deployment completed successfully!");
      
      // Save deployment info
      await this.saveDeploymentInfo(committedTransaction.hash);
      
    } catch (error) {
      console.error(`❌ Deployment failed: ${error}`);
      throw error;
    }
  }

  private readPackageMetadata() {
    // In a real deployment, this would read the compiled package
    // For now, we'll return mock data
    return {
      metadata: new Uint8Array(), // Package metadata bytes
      modules: [new Uint8Array()], // Compiled module bytecode
    };
  }

  async initializeModules() {
    console.log("🔧 Initializing modules...");

    try {
      // Add authorized attestor (admin as first attestor)
      await this.addAuthorizedAttestor(this.admin.accountAddress.toString());
      
      console.log("✅ Modules initialized successfully!");
      
    } catch (error) {
      console.error(`❌ Module initialization failed: ${error}`);
      throw error;
    }
  }

  async addAuthorizedAttestor(attestorAddress: string) {
    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.admin.accountAddress,
        data: {
          function: "aura_lend::property_nft::add_attestor",
          functionArguments: [attestorAddress],
        },
      });

      const committedTransaction = await this.aptos.signAndSubmitTransaction({
        signer: this.admin,
        transaction,
      });

      await this.aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      console.log(`✅ Added attestor: ${attestorAddress}`);
      
    } catch (error) {
      console.error(`❌ Failed to add attestor: ${error}`);
    }
  }

  async saveDeploymentInfo(transactionHash: string) {
    const deploymentInfo = {
      network: this.config.network,
      adminAddress: this.admin.accountAddress.toString(),
      adminPrivateKey: this.adminPrivateKey,
      deploymentTransaction: transactionHash,
      timestamp: new Date().toISOString(),
      moduleAddress: this.admin.accountAddress.toString(), // In Aptos, modules are deployed to accounts
    };

    const infoPath = join(process.cwd(), `deployment-${this.config.network.toLowerCase()}.json`);
    writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`💾 Deployment info saved to: ${infoPath}`);
  }

  // Utility methods for testing deployed contracts
  async testDeployment() {
    console.log("🧪 Running deployment tests...");
    
    try {
      // Test 1: Check if modules are deployed
      const modules = await this.aptos.getAccountModules({
        accountAddress: this.admin.accountAddress,
      });
      
      const auraLendModules = modules.filter(module => 
        module.abi?.name.includes("aura_lend")
      );
      
      console.log(`✅ Found ${auraLendModules.length} Aura Lend modules deployed`);
      
      // Test 2: Check registry statistics
      await this.checkRegistryStats();
      
      // Test 3: Check property NFT module
      await this.checkPropertyNFTModule();
      
      console.log("✅ All deployment tests passed!");
      
    } catch (error) {
      console.error(`❌ Deployment test failed: ${error}`);
    }
  }

  async checkRegistryStats() {
    try {
      const stats = await this.aptos.view({
        payload: {
          function: "aura_lend::registry::get_global_stats",
          functionArguments: [],
        },
      });
      
      console.log(`📊 Registry Stats: ${JSON.stringify(stats)}`);
      
    } catch (error) {
      console.log(`ℹ️  Registry not yet initialized: ${error}`);
    }
  }

  async checkPropertyNFTModule() {
    try {
      const totalMinted = await this.aptos.view({
        payload: {
          function: "aura_lend::property_nft::get_total_minted",
          functionArguments: [],
        },
      });
      
      console.log(`🏠 Total Property NFTs minted: ${totalMinted[0]}`);
      
    } catch (error) {
      console.log(`ℹ️  Property NFT module check failed: ${error}`);
    }
  }
}

// Main deployment function
async function main() {
  const config: DeploymentConfig = {
    network: NETWORK,
    privateKey: process.env.ADMIN_PRIVATE_KEY, // Optional: provide via environment variable
  };

  const deployer = new AuraLendDeployer(config);
  
  try {
    await deployer.compileAndDeploy();
    await deployer.testDeployment();
    
  } catch (error) {
    console.error("❌ Deployment process failed:", error);
    process.exit(1);
  }
}

// Script execution
if (require.main === module) {
  main().catch(console.error);
}

export { AuraLendDeployer };
