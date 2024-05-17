"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseSlowSync = void 0;
const ethers_1 = require("ethers");
const helpers_1 = require("../../helpers");
const config_1 = require("../config");
// Configuring base contracts
const ADDRESS_MANAGER = '0x8EfB6B5c4767B09Dc9AA6Af4eAA89F749522BaE2';
const L1_CROSS_DOMAIN_MESSENGER = '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa';
const L1_STANDARD_BRIDGE = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35';
const OPTIMISM_PORTAL = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e';
const L2_OUTPUT_ORACLE = '0x56315b90c40730925ec5485cf004d835058518A0';
const BASE_CHAIN_ID = 8453;
async function baseSlowSync(chain) {
    // TODO: Reduce to 10 days once we have cleared out the backlog
    const initialStartBlock = await (0, helpers_1.calculateStartBlock)(chain.provider, 2, 30);
    const baseMessengerConfig = {
        l2ChainId: BASE_CHAIN_ID,
        l2Signer: new ethers_1.Wallet(config_1.PRIVATE_KEY, chain.provider),
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    };
    const baseMessenger = (0, helpers_1.CreateCrossChainMessenger)(baseMessengerConfig);
    let withdraws = await (0, helpers_1.fetchOPBridgeTxs)(initialStartBlock, chain, baseMessenger);
    withdraws = await (0, helpers_1.proveOrRelayMessage)(withdraws, baseMessenger);
    return await (0, helpers_1.buildOPReport)(withdraws, chain);
}
exports.baseSlowSync = baseSlowSync;
