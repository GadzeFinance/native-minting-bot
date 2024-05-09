"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineaSlowSync = void 0;
const linea_sdk_1 = require("@consensys/linea-sdk");
const config_1 = require("../config");
async function lineaSlowSync(chain) {
    const startBlockInitial = 0;
    const sdk = new linea_sdk_1.LineaSDK({
        l1RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
        l2RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
        l1SignerPrivateKey: config_1.PRIVATE_KEY,
        l2SignerPrivateKey: config_1.PRIVATE_KEY,
        network: "linea-mainnet",
        mode: "read-write",
    });
    return 0;
}
exports.lineaSlowSync = lineaSlowSync;
