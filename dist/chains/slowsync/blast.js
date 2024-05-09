"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blastSlowSync = void 0;
const helpers_1 = require("../../helpers");
// Configuring Blast Contracts
const ADDRESS_MANAGER = '0xE064B565Cf2A312a3e66Fe4118890583727380C0';
const L1_CROSS_DOMAIN_MESSENGER = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0';
const L1_STANDARD_BRIDGE = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524';
const OPTIMISM_PORTAL = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb';
const L2_OUTPUT_ORACLE = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76';
const BLAST_L2_MESSENGER_ADDRESS = '0x4200000000000000000000000000000000000007';
const BLAST_CHAIN_ID = 81457;
async function blastSlowSync(chain) {
    // TODO: Reduce to 17 days once we have cleared out the backlog
    const initialStartBlock = await (0, helpers_1.calculateStartBlock)(chain.provider, 2, 21);
    const blastMessengerConfig = {
        l2ChainId: BLAST_CHAIN_ID,
        l2Signer: chain.wallet,
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    };
    const blastMessenger = (0, helpers_1.CreateCrossChainMessenger)(blastMessengerConfig);
    const { hashes, totalValue } = await (0, helpers_1.fetchOPBridgeTxs)(initialStartBlock, BLAST_L2_MESSENGER_ADDRESS, chain);
    await (0, helpers_1.proveOrRelayMessage)(hashes, blastMessenger);
    return totalValue;
}
exports.blastSlowSync = blastSlowSync;
