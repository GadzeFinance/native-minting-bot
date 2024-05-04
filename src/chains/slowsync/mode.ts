import { CrossChainMessenger } from '@eth-optimism/sdk';
import { constants, Wallet } from 'ethers';
import { fetchOPBridgeTxs, proveOrRelayMessage } from '../helpers';
import { PRIVATE_KEY, chains, mainnetWallet } from '../config';

// configuring blast contracts
const AddressManager = '';
const L1CrossDomainMessenger = '';
const L1StandardBridge = ''; 
const OptimismPortal = '';
const L2OutputOracle = '';

const modeL2MessengerAddress = ''; 

// configure the blast messenger
const modeMessenger = new CrossChainMessenger({
    l1ChainId: 1,
    l2ChainId: 919,
    // chain[0] is the blast chain
    l1SignerOrProvider: new Wallet(PRIVATE_KEY, chains[0].provider),
    l2SignerOrProvider: mainnetWallet,

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

export async function blastSlowSync(): Promise<void> {
    // todo: decide on how to prune state
    const startBlockInitial = 2612000;

    const withdrawalTxs = await fetchOPBridgeTxs(startBlockInitial, modeL2MessengerAddress, chains[0].provider);

    for (const txHash of withdrawalTxs) {
        await proveOrRelayMessage(txHash, modeMessenger, chains[0].provider);
    }
}
