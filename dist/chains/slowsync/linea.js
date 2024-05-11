"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineaSlowSync = void 0;
const linea_sdk_1 = require("@consensys/linea-sdk");
const config_1 = require("../config");
async function lineaSlowSync(chain) {
    const sdk = new linea_sdk_1.LineaSDK({
        l1RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
        l2RpcUrl: 'https://linea-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52',
        l1SignerPrivateKey: config_1.PRIVATE_KEY,
        l2SignerPrivateKey: config_1.PRIVATE_KEY,
        network: "linea-mainnet",
        mode: "read-write",
    });
    const l1ClaimingService = sdk.getL1ClaimingService();
    const messageStatus = await l1ClaimingService.getMessageStatus("0x5150983a81354de36e04a074555b76d10c47fb475a1a0cbb557ccce747cd7e69");
    console.log(messageStatus);
    return 0;
}
exports.lineaSlowSync = lineaSlowSync;
