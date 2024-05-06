"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proveOrRelayMessage = exports.fetchOPBridgeTxs = void 0;
const ethers_1 = require("ethers");
const L2CrossDomainMessager_json_1 = __importDefault(require("../abis/L2CrossDomainMessager.json"));
const sdk_1 = require("@eth-optimism/sdk");
// The OP stack sdk methods for proving and relaying withdraws take the transaction hashs that initiated the withdraw as input. This function fetches
// all such hashes for a given L2 from a given `initialStartBlock`.
async function fetchOPBridgeTxs(initialStartBlock, l2MessengerAddress, l2Provider) {
    // todo: potentially make this configurable?
    const blockInterval = 50000;
    const l2BridgeContract = new ethers_1.Contract(l2MessengerAddress, L2CrossDomainMessager_json_1.default, l2Provider);
    let hashes = [];
    try {
        const latestBlockNumber = await l2Provider.getBlockNumber();
        for (let startBlock = initialStartBlock; startBlock <= latestBlockNumber; startBlock += blockInterval) {
            let endBlock = startBlock + blockInterval - 1;
            if (endBlock > latestBlockNumber) {
                endBlock = latestBlockNumber;
            }
            const filter = {
                address: l2MessengerAddress,
                topics: [
                    // event that gets emitted when the `syncpool` sents eth to the OP stack bridge
                    l2BridgeContract.filters.SentMessageExtension1().topics[0],
                    "0x00000000000000000000000052c4221cb805479954cde5accff8c4dcaf96623b"
                ],
                fromBlock: startBlock,
                toBlock: endBlock
            };
            const logs = await l2Provider.getLogs(filter);
            console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
            logs.forEach((log) => {
                hashes.push(log.transactionHash);
            });
        }
    }
    catch (error) {
        console.error(error);
    }
    return hashes;
}
exports.fetchOPBridgeTxs = fetchOPBridgeTxs;
// for a given L2 transaction hash, this function:
// 1. gets the status of the transaction
// 2. `proves` or `relays` the transaction if in ready state
async function proveOrRelayMessage(txHash, crossChainMessenger) {
    try {
        const curTxStatus = await crossChainMessenger.getMessageStatus(txHash);
        console.log(`Message ${txHash} status: ${sdk_1.MessageStatus[curTxStatus]}`);
        if (curTxStatus === sdk_1.MessageStatus.READY_TO_PROVE) {
            console.log(`Proving tx ${txHash}`);
            await crossChainMessenger.proveMessage(txHash);
        }
        else if (curTxStatus === sdk_1.MessageStatus.READY_FOR_RELAY) {
            console.log(`Relaying tx ${txHash}`);
            await crossChainMessenger.finalizeMessage(txHash);
        }
    }
    catch (error) {
        console.log(`Error for tx ${txHash}`);
        console.error(error);
    }
    return Promise.resolve();
}
exports.proveOrRelayMessage = proveOrRelayMessage;
