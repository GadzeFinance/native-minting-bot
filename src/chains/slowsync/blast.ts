import { CrossChainMessenger } from '@eth-optimism/sdk';
import { constants } from 'ethers';

// configuring blast contracts
const AddressManager = '0xE064B565Cf2A312a3e66Fe4118890583727380C0';
const L1CrossDomainMessenger = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0';
const L1StandardBridge = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524'; 
const OptimismPortal = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb';
const L2OutputOracle = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76';

// configure the blast messenger
const blastMessager = new CrossChainMessenger({
    l1ChainId: 1,
    l2ChainId: 81457,
    l1SignerOrProvider: l1Wallet,
    l2SignerOrProvider: l2Wallet,

    contracts: {
        l1: {
        AddressManager,
        L1CrossDomainMessenger,
        L1StandardBridge,
        OptimismPortal,
        L2OutputOracle,
    
        // Need to be set to zero for this version of the SDK.
        StateCommitmentChain: constants.AddressZero,
        CanonicalTransactionChain: constants.AddressZero,
        BondManager: constants.AddressZero,
        }
    }
});