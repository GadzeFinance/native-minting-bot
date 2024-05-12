"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineaSlowSync = void 0;
const linea_sdk_1 = require("@consensys/linea-sdk");
const config_1 = require("../config");
const sdk = new linea_sdk_1.LineaSDK({
    l1RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
    l2RpcUrl: 'https://linea-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52',
    l1SignerPrivateKey: config_1.PRIVATE_KEY,
    l2SignerPrivateKey: config_1.PRIVATE_KEY,
    network: "linea-mainnet",
    mode: "read-write",
});
const l2Contract = sdk.getL2Contract();
const l1ClaimingService = sdk.getL1ClaimingService();
async function lineaSlowSync() {
    // todo: filter to get all of the linea transaction hashes and the withdrawHash that is emitted from said contract
    let lineaTransactions = [];
    for (const transaction of lineaTransactions) {
        const messageStatus = await l1ClaimingService.getMessageStatus(transaction.transactionHash);
        if (messageStatus == linea_sdk_1.OnChainMessageStatus.CLAIMABLE) {
            const message = await l2Contract.getMessageByMessageHash(transaction.withdrawHash);
            await l1ClaimingService.claimMessage(message);
        }
    }
    return 0;
}
exports.lineaSlowSync = lineaSlowSync;
