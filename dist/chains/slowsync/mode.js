"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modeSlowSync = void 0;
const ethers_1 = require("ethers");
const helpers_1 = require("../../helpers");
const config_1 = require("../config");
// configuring mode contracts
const ADDRESS_MANAGER = '0x50eF494573f28Cad6B64C31b7a00Cdaa48306e15';
const L1_CROSS_DOMAIN_MESSENGER = '0x95bDCA6c8EdEB69C98Bd5bd17660BaCef1298A6f';
const L1_STANDARD_BRIDGE = '0x735aDBbE72226BD52e818E7181953f42E3b0FF21';
const OPTIMISM_PORTAL = '0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07';
const L2_OUTPUT_ORACLE = '0x4317ba146D4933D889518a3e5E11Fe7a53199b04';
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
    let withdraws = await (0, helpers_1.fetchOPBridgeTxs)(initialStartBlock, chain, modeMessenger);
    withdraws = await (0, helpers_1.proveOrRelayMessage)(withdraws, modeMessenger);
    const reportString = await (0, helpers_1.buildOPReport)(withdraws, chain);
    return reportString;
}
exports.modeSlowSync = modeSlowSync;
