"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blastSlowSync = void 0;
const sdk_1 = require("@eth-optimism/sdk");
const ethers_1 = require("ethers");
const helpers_1 = require("../helpers");
const config_1 = require("../config");
// configuring blast contracts
const AddressManager = '';
const L1CrossDomainMessenger = '';
const L1StandardBridge = '';
const OptimismPortal = '';
const L2OutputOracle = '';
const modeL2MessengerAddress = '';
// configure the blast messenger
const modeMessenger = new sdk_1.CrossChainMessenger({
    l1ChainId: 1,
    l2ChainId: 919,
    // chain[0] is the blast chain
    l1SignerOrProvider: new ethers_1.Wallet(config_1.PRIVATE_KEY, config_1.chains[0].provider),
    l2SignerOrProvider: config_1.mainnetWallet,
    contracts: {
        l1: {
            AddressManager,
            L1CrossDomainMessenger,
            L1StandardBridge,
            OptimismPortal,
            L2OutputOracle,
            // Need to be set to zero for this version of the SDK.
            StateCommitmentChain: ethers_1.constants.AddressZero,
            CanonicalTransactionChain: ethers_1.constants.AddressZero,
            BondManager: ethers_1.constants.AddressZero,
        }
    }
});
async function blastSlowSync() {
    // todo: decide on how to prune state
    const startBlockInitial = 2612000;
    const withdrawalTxs = await (0, helpers_1.fetchOPBridgeTxs)(startBlockInitial, modeL2MessengerAddress, config_1.chains[0].provider);
    for (const txHash of withdrawalTxs) {
        await (0, helpers_1.proveOrRelayMessage)(txHash, modeMessenger);
    }
}
exports.blastSlowSync = blastSlowSync;
