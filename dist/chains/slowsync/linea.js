"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineaSlowSync = void 0;
const linea_sdk_1 = require("@consensys/linea-sdk");
const config_1 = require("../config");
const helpers_1 = require("../../helpers");
const ethers_1 = require("ethers");
const MessageSentABI = [{
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "_from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "_to", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "_fee", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "_value", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "_nonce", "type": "uint256" },
            { "indexed": false, "internalType": "bytes", "name": "_calldata", "type": "bytes" },
            { "indexed": true, "internalType": "bytes32", "name": "_messageHash", "type": "bytes32" }
        ],
        "name": "MessageSent",
        "type": "event"
    }];
const lineaMessageSentInterface = new ethers_1.utils.Interface(MessageSentABI);
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
async function lineaSlowSync(chain) {
    const initialStartBlock = await (0, helpers_1.calculateStartBlock)(chain.provider, 2, 10);
    const withdraws = await (0, helpers_1.fetchSyncPoolTxs)(initialStartBlock, chain);
    // extract the _messageHash from the logs to be used in the `getMessageByMessageHash` method
    let lineaMessageHashes = [];
    for (const withdraw of withdraws) {
        const withdrawReceipt = await chain.provider.getTransactionReceipt(withdraw.transactionHash);
        const messageSentLog = lineaMessageSentInterface.parseLog(withdrawReceipt.logs[4]);
        lineaMessageHashes.push(messageSentLog.args._messageHash);
    }
    for (const messageHash of lineaMessageHashes) {
        const messageStatus = await l1ClaimingService.getMessageStatus(messageHash);
        if (messageStatus == linea_sdk_1.OnChainMessageStatus.CLAIMABLE) {
            const message = await l2Contract.getMessageByMessageHash(messageHash);
            await l1ClaimingService.claimMessage(message);
        }
    }
    return "value";
}
exports.lineaSlowSync = lineaSlowSync;
