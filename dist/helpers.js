"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStartBlock = exports.proveOrRelayMessage = exports.fetchOPBridgeTxs = exports.CreateCrossChainMessenger = void 0;
const ethers_1 = require("ethers");
const L2CrossDomainMessenger_json_1 = __importDefault(require("./abis/L2CrossDomainMessenger.json"));
const sdk_1 = require("@eth-optimism/sdk");
const config_1 = require("./chains/config");
// Generating a CrossChainMessenger instance for a specific L2 chain
function CreateCrossChainMessenger(chainConfig) {
    return new sdk_1.CrossChainMessenger({
        l1ChainId: 1,
        l2ChainId: chainConfig.l2ChainId,
        l1SignerOrProvider: config_1.MAINNET_WALLET,
        l2SignerOrProvider: chainConfig.l2Signer,
        contracts: {
            l1: {
                AddressManager: chainConfig.addressManager,
                L1CrossDomainMessenger: chainConfig.l1CrossDomainMessenger,
                L1StandardBridge: chainConfig.l1StandardBridge,
                OptimismPortal: chainConfig.optimismPortal,
                L2OutputOracle: chainConfig.l2OutputOracle,
                // Need to be set to zero for this version of the SDK.
                StateCommitmentChain: ethers_1.constants.AddressZero,
                CanonicalTransactionChain: ethers_1.constants.AddressZero,
                BondManager: ethers_1.constants.AddressZero,
            }
        }
    });
}
exports.CreateCrossChainMessenger = CreateCrossChainMessenger;
// The OP stack sdk methods for proving and relaying withdraws take the transaction hashes that initiated the withdraw as input. This function fetches
// all such hashes for a given L2 from a given `initialStartBlock`.
async function fetchOPBridgeTxs(initialStartBlock, l2MessengerAddress, chain) {
    // todo: potentially make this configurable?
    const blockInterval = 50000;
    const l2BridgeContract = new ethers_1.Contract(l2MessengerAddress, L2CrossDomainMessenger_json_1.default, chain.provider);
    let hashes = [];
    let totalValue = 0;
    const latestBlockNumber = await chain.provider.getBlockNumber();
    for (let startBlock = initialStartBlock; startBlock <= latestBlockNumber; startBlock += blockInterval) {
        let endBlock = startBlock + blockInterval - 1;
        if (endBlock > latestBlockNumber) {
            endBlock = latestBlockNumber;
        }
        const filter = {
            address: l2MessengerAddress,
            topics: [
                // event that gets emitted when the `syncpool` sends eth to the OP stack bridge
                l2BridgeContract.filters.SentMessageExtension1().topics[0],
                ethers_1.utils.hexZeroPad(chain.syncPoolAddress, 32),
            ],
            fromBlock: startBlock,
            toBlock: endBlock
        };
        const logs = await chain.provider.getLogs(filter);
        logs.forEach(async (log) => {
            const event = l2BridgeContract.interface.parseLog(log);
            console.log(`Transaction Hash: ${log.transactionHash}`);
            console.log(`Value: ${event.args.value.toString()}`);
            totalValue += parseInt(ethers_1.utils.formatEther(event.args.value.toString()));
        });
        console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
        logs.forEach((log) => {
            hashes.push(log.transactionHash);
        });
    }
    return {
        hashes,
        totalValue
    };
}
exports.fetchOPBridgeTxs = fetchOPBridgeTxs;
// for a given L2 transaction hash, this function:
// 1. gets the status of the transaction
// 2. `proves` or `relays` the transaction if in ready state
async function proveOrRelayMessage(txHashes, crossChainMessenger) {
    for (const txHash of txHashes) {
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
    return Promise.resolve();
}
exports.proveOrRelayMessage = proveOrRelayMessage;
// sends a message to a discord webhook
// export async function sendDiscordMessage(message: string): Promise<void> {
//   try {
//       await axios.post(DISCORD_WEBHOOK_URL, {
//         username: 'Bridge Bot',
//         content: message
//       });
//   } catch (error) {
//       console.error(`Failed to send message to discord: ${error}`);
//   }
// }
// calculate start block for fetching bridge transactions
// blockTimeSeconds - how often blocks are produced in seconds (all OP stack chains have 2s block time)
// daysToIndex - The amount of days to index back for withdraw events
async function calculateStartBlock(provider, blockTimeSeconds, daysToIndex) {
    // calculate the amount of block
    const secondsToIndex = daysToIndex * 24 * 60 * 60;
    const blocksToIndex = Math.floor(secondsToIndex / blockTimeSeconds);
    const currentBlock = await provider.getBlockNumber();
    return Math.max(currentBlock - blocksToIndex, 0);
}
exports.calculateStartBlock = calculateStartBlock;
