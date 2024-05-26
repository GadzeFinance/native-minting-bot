"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineaSlowSync = void 0;
const linea_sdk_1 = require("@consensys/linea-sdk");
const config_1 = require("../config");
const helpers_1 = require("../../helpers");
const L2SyncPool_json_1 = __importDefault(require("../../abis/L2SyncPool.json"));
const ethers_1 = require("ethers");
const date_fns_1 = require("date-fns");
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
const syncPoolInterface = new ethers_1.utils.Interface(L2SyncPool_json_1.default);
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
    const initialStartBlock = await (0, helpers_1.calculateStartBlock)(chain.provider, 2, 30);
    const withdraws = await (0, helpers_1.fetchSyncPoolTxs)(initialStartBlock, chain);
    let discordString = "";
    let totalWeiPending = ethers_1.BigNumber.from(0);
    for (const withdraw of withdraws) {
        console.log(`Transaction Hash: ${withdraw.transactionHash}`);
        // extracting the _messageHash from the logs
        const withdrawReceipt = await chain.provider.getTransactionReceipt(withdraw.transactionHash);
        const messageSentLog = lineaMessageSentInterface.parseLog(withdrawReceipt.logs[4]);
        const _messageHash = messageSentLog.args._messageHash;
        // extracting the withdraw amount from the logs
        const syncEvent = syncPoolInterface.parseLog(withdrawReceipt.logs[0]);
        const withdrawAmount = syncEvent.args.amountIn;
        console.log(`Value: ${withdrawAmount.toString()}`);
        // the _messageHash field is the input for the linea sdk methods
        let messageStatus = await l1ClaimingService.getMessageStatus(_messageHash);
        console.log(`Withdraw Status: ${messageStatus}`);
        // claim claimable withdraws
        if (messageStatus === linea_sdk_1.OnChainMessageStatus.CLAIMABLE) {
            console.log(`Claiming withdraw ${withdraw}`);
            const message = await l2Contract.getMessageByMessageHash(_messageHash);
            await l1ClaimingService.claimMessage(message);
            messageStatus = linea_sdk_1.OnChainMessageStatus.CLAIMED;
        }
        // generate discord messages for all unclaimed withdraws
        if (messageStatus != linea_sdk_1.OnChainMessageStatus.CLAIMED) {
            totalWeiPending = totalWeiPending.add(withdrawAmount);
            // get the expect arrival date of the withdraw
            const block = await chain.provider.getBlock(withdrawReceipt.blockNumber);
            let expectedDate = (0, date_fns_1.addDays)(new Date(block.timestamp * 1000), 1); // zk withdraws should ready for relay in 1 day
            const formattedDate = (0, date_fns_1.format)(expectedDate, 'MMMM do');
            const totalEther = parseFloat(ethers_1.utils.formatEther(withdrawAmount)).toFixed(2);
            discordString += `${totalEther} ETH expected by ${formattedDate}\n`;
        }
    }
    const totalEther = parseFloat(ethers_1.utils.formatEther(totalWeiPending)).toFixed(2);
    discordString = `linea: ${totalEther} total ETH \n--------------------------------\n${discordString}\n`;
    console.log(discordString);
    return { totalWei: totalWeiPending, discordReport: discordString };
}
exports.lineaSlowSync = lineaSlowSync;
