"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blastSlowSync = void 0;
const sdk_1 = require("@eth-optimism/sdk");
const ethers_1 = require("ethers");
const helpers_1 = require("../helpers");
const config_1 = require("../config");
// configuring blast contracts
const AddressManager = '0xE064B565Cf2A312a3e66Fe4118890583727380C0';
const L1CrossDomainMessenger = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0';
const L1StandardBridge = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524';
const OptimismPortal = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb';
const L2OutputOracle = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76';
const blastL2MessengerAddress = '0x4200000000000000000000000000000000000007';
// configure the blast messenger
const blastMessenger = new sdk_1.CrossChainMessenger({
    l1ChainId: 1,
    l2ChainId: 81457,
    // chain[0] is the blast chain
    l1SignerOrProvider: config_1.mainnetWallet,
    l2SignerOrProvider: new ethers_1.Wallet(config_1.PRIVATE_KEY, config_1.chains[0].provider),
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
    const withdrawalTxs = await (0, helpers_1.fetchOPBridgeTxs)(startBlockInitial, blastL2MessengerAddress, config_1.chains[0].provider);
    for (const txHash of withdrawalTxs) {
        await (0, helpers_1.proveOrRelayMessage)(txHash, blastMessenger);
    }
}
exports.blastSlowSync = blastSlowSync;
