module aura_lend::property_nft {
    use std::string::String;
    use std::vector;
    use std::signer;
    use std::error;
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_framework::timestamp;
    use aura_lend::events;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_NFT_ALREADY_EXISTS: u64 = 2;
    const E_NFT_NOT_FOUND: u64 = 3;
    const E_ALREADY_ATTESTED: u64 = 4;
    const E_NOT_OWNER: u64 = 5;
    const E_INVALID_PROPERTY_ID: u64 = 6;

    /// Property NFT representation
    struct PropertyNFT has key, store, drop {
        property_id: u64,
        owner: address,
        valuation_hash: vector<u8>,
        is_attested: bool,
        attestor: address,
        created_at: u64,
        attested_at: u64,
        metadata_uri: String,
    }

    /// Global registry to track all NFTs and manage property IDs
    struct PropertyRegistry has key {
        next_property_id: u64,
        total_nfts_minted: u64,
        authorized_attestors: vector<address>,
    }

    /// Collection of PropertyNFTs owned by a user
    struct PropertyCollection has key {
        nfts: SimpleMap<u64, PropertyNFT>,
    }

    /// Initialize the PropertyNFT module
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        move_to(admin, PropertyRegistry {
            next_property_id: 1,
            total_nfts_minted: 0,
            authorized_attestors: vector::empty(),
        });
    }

    /// Mint a new Property NFT
    public entry fun mint_property_nft(
        owner: &signer,
        valuation_hash: vector<u8>,
        metadata_uri: String,
    ) acquires PropertyRegistry, PropertyCollection {
        let owner_addr = signer::address_of(owner);
        
        // Get next property ID
        let registry = borrow_global_mut<PropertyRegistry>(@aura_lend);
        let property_id = registry.next_property_id;
        registry.next_property_id = property_id + 1;
        registry.total_nfts_minted = registry.total_nfts_minted + 1;

        // Create the NFT
        let property_nft = PropertyNFT {
            property_id,
            owner: owner_addr,
            valuation_hash,
            is_attested: false,
            attestor: @0x0,
            created_at: timestamp::now_seconds(),
            attested_at: 0,
            metadata_uri,
        };

        // Initialize or update user's collection
        if (!exists<PropertyCollection>(owner_addr)) {
            move_to(owner, PropertyCollection {
                nfts: simple_map::create(),
            });
        };
        
        let collection = borrow_global_mut<PropertyCollection>(owner_addr);
        simple_map::add(&mut collection.nfts, property_id, property_nft);

        // Emit event
        events::emit_property_nft_minted(property_id, owner_addr, valuation_hash, timestamp::now_seconds());
    }

    /// Attest a Property NFT (only authorized attestors)
    public entry fun attest_property(
        attestor: &signer,
        nft_owner: address,
        property_id: u64,
    ) acquires PropertyRegistry, PropertyCollection {
        let attestor_addr = signer::address_of(attestor);
        
        // Check if attestor is authorized
        let registry = borrow_global<PropertyRegistry>(@aura_lend);
        assert!(vector::contains(&registry.authorized_attestors, &attestor_addr), error::permission_denied(E_NOT_AUTHORIZED));

        // Get the NFT and attest it
        assert!(exists<PropertyCollection>(nft_owner), error::not_found(E_NFT_NOT_FOUND));
        let collection = borrow_global_mut<PropertyCollection>(nft_owner);
        assert!(simple_map::contains_key(&collection.nfts, &property_id), error::not_found(E_NFT_NOT_FOUND));
        
        let nft = simple_map::borrow_mut(&mut collection.nfts, &property_id);
        assert!(!nft.is_attested, error::invalid_state(E_ALREADY_ATTESTED));
        
        nft.is_attested = true;
        nft.attestor = attestor_addr;
        nft.attested_at = timestamp::now_seconds();

        // Emit event
        events::emit_property_nft_attested(property_id, attestor_addr, timestamp::now_seconds());
    }

    /// Transfer ownership of a Property NFT
    public entry fun transfer_property(
        current_owner: &signer,
        new_owner_addr: address,
        property_id: u64,
    ) acquires PropertyCollection {
        let current_owner_addr = signer::address_of(current_owner);
        
        // Remove NFT from current owner
        assert!(exists<PropertyCollection>(current_owner_addr), error::not_found(E_NFT_NOT_FOUND));
        let current_collection = borrow_global_mut<PropertyCollection>(current_owner_addr);
        assert!(simple_map::contains_key(&current_collection.nfts, &property_id), error::not_found(E_NFT_NOT_FOUND));
        
        let (_, nft) = simple_map::remove(&mut current_collection.nfts, &property_id);
        
        // Update owner in NFT
        let updated_nft = PropertyNFT {
            property_id: nft.property_id,
            owner: new_owner_addr,
            valuation_hash: nft.valuation_hash,
            is_attested: nft.is_attested,
            attestor: nft.attestor,
            created_at: nft.created_at,
            attested_at: nft.attested_at,
            metadata_uri: nft.metadata_uri,
        };
        
        // Add to new owner's collection
        if (!exists<PropertyCollection>(new_owner_addr)) {
            // We can't initialize for another account, so this transfer is only possible
            // if the new owner already has a collection or does it themselves
            abort error::invalid_state(E_NOT_AUTHORIZED)
        };
        
        let new_collection = borrow_global_mut<PropertyCollection>(new_owner_addr);
        simple_map::add(&mut new_collection.nfts, property_id, updated_nft);

        // We'll omit the transfer event for now since it's not defined in events.move
    }

    /// Add authorized attestor (admin only)
    public entry fun add_attestor(
        admin: &signer,
        new_attestor: address,
    ) acquires PropertyRegistry {
        assert!(signer::address_of(admin) == @aura_lend, error::permission_denied(E_NOT_AUTHORIZED));
        
        let registry = borrow_global_mut<PropertyRegistry>(@aura_lend);
        if (!vector::contains(&registry.authorized_attestors, &new_attestor)) {
            vector::push_back(&mut registry.authorized_attestors, new_attestor);
        };
    }

    /// Remove authorized attestor (admin only)
    public entry fun remove_attestor(
        admin: &signer,
        attestor_to_remove: address,
    ) acquires PropertyRegistry {
        assert!(signer::address_of(admin) == @aura_lend, error::permission_denied(E_NOT_AUTHORIZED));
        
        let registry = borrow_global_mut<PropertyRegistry>(@aura_lend);
        let (found, index) = vector::index_of(&registry.authorized_attestors, &attestor_to_remove);
        if (found) {
            vector::remove(&mut registry.authorized_attestors, index);
        };
    }

    /// Get property NFT details
    public fun get_property_nft(owner: address, property_id: u64): (u64, address, vector<u8>, bool, address, u64, u64, String) acquires PropertyCollection {
        assert!(exists<PropertyCollection>(owner), error::not_found(E_NFT_NOT_FOUND));
        let collection = borrow_global<PropertyCollection>(owner);
        assert!(simple_map::contains_key(&collection.nfts, &property_id), error::not_found(E_NFT_NOT_FOUND));
        
        let nft = simple_map::borrow(&collection.nfts, &property_id);
        (
            nft.property_id,
            nft.owner,
            nft.valuation_hash,
            nft.is_attested,
            nft.attestor,
            nft.created_at,
            nft.attested_at,
            nft.metadata_uri,
        )
    }

    /// Get user's property IDs
    public fun get_user_properties(owner: address): vector<u64> acquires PropertyCollection {
        if (!exists<PropertyCollection>(owner)) {
            return vector::empty()
        };
        
        let collection = borrow_global<PropertyCollection>(owner);
        simple_map::keys(&collection.nfts)
    }

    /// Get registry statistics
    public fun get_registry_stats(): (u64, u64) acquires PropertyRegistry {
        let registry = borrow_global<PropertyRegistry>(@aura_lend);
        (registry.next_property_id - 1, registry.total_nfts_minted)
    }

    /// Check if property exists
    public fun property_exists(owner: address, property_id: u64): bool acquires PropertyCollection {
        if (!exists<PropertyCollection>(owner)) {
            return false
        };
        
        let collection = borrow_global<PropertyCollection>(owner);
        simple_map::contains_key(&collection.nfts, &property_id)
    }

    /// Check if property is attested
    public fun is_property_attested(owner: address, property_id: u64): bool acquires PropertyCollection {
        assert!(exists<PropertyCollection>(owner), error::not_found(E_NFT_NOT_FOUND));
        let collection = borrow_global<PropertyCollection>(owner);
        assert!(simple_map::contains_key(&collection.nfts, &property_id), error::not_found(E_NFT_NOT_FOUND));
        
        let nft = simple_map::borrow(&collection.nfts, &property_id);
        nft.is_attested
    }
}
