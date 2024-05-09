"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modeSlowSync = void 0;
const ethers_1 = require("ethers");
const helpers_1 = require("../../helpers");
const config_1 = require("../config");
// Mode Contracts
const ADDRESS_MANAGER = '';
const L1_CROSS_DOMAIN_MESSENGER = '';
const L1_STANDARD_BRIDGE = '';
const OPTIMISM_PORTAL = '';
const L2_OUTPUT_ORACLE = '';
const MODE_L2_MESSENGER_ADDRESS = '0xC0d3c0d3c0D3c0D3C0d3C0D3C0D3c0d3c0d30007';
const MODE_CHAIN_ID = 34443;
async function modeSlowSync(chain) {
    // TODO: Reduce to 10 days once we have cleared out the backlog
    const initialStartBlock = await (0, helpers_1.calculateStartBlock)(chain.provider, 2, 21);
    const modeMessengerConfig = {
        l2ChainId: MODE_CHAIN_ID,
        l2Signer: new ethers_1.Wallet(config_1.PRIVATE_KEY, chain.provider),
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    };
    const modeMessenger = (0, helpers_1.CreateCrossChainMessenger)(modeMessengerConfig);
    const { hashes, totalValue } = await (0, helpers_1.fetchOPBridgeTxs)(initialStartBlock, MODE_L2_MESSENGER_ADDRESS, chain);
    await (0, helpers_1.proveOrRelayMessage)(hashes, modeMessenger);
    return totalValue;
}
exports.modeSlowSync = modeSlowSync;
