"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSyncPoolTxs = exports.calculateStartBlock = exports.sendDiscordMessage = exports.buildOPReport = exports.proveOrRelayMessage = exports.fetchOPBridgeTxs = exports.CreateCrossChainMessenger = void 0;
const ethers_1 = require("ethers");
const L2CrossDomainMessenger_json_1 = __importDefault(require("./abis/L2CrossDomainMessenger.json"));
const sdk_1 = require("@eth-optimism/sdk");
const config_1 = require("./chains/config");
const date_fns_1 = require("date-fns");
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
async function fetchOPBridgeTxs(initialStartBlock, chain, crossChainMessenger) {
    const blockInterval = 50000;
    const l2BridgeContract = new ethers_1.Contract(config_1.L2_CROSS_DOMAIN_MESSENGER, L2CrossDomainMessenger_json_1.default, chain.provider);
    let res = [];
    let withdrawLogs = [];
    // fetching all withdraw logs from that originate from the syncpool
    const latestBlockNumber = await chain.provider.getBlockNumber();
    for (let startBlock = initialStartBlock; startBlock <= latestBlockNumber; startBlock += blockInterval) {
        let endBlock = startBlock + blockInterval - 1;
        if (endBlock > latestBlockNumber) {
            endBlock = latestBlockNumber;
        }
        const filter = {
            address: config_1.L2_CROSS_DOMAIN_MESSENGER,
            topics: [
                // event that gets emitted when the `syncpool` sends eth to the OP stack bridge
                l2BridgeContract.filters.SentMessageExtension1().topics[0],
                ethers_1.utils.hexZeroPad(chain.syncPoolAddress, 32),
            ],
            fromBlock: startBlock,
            toBlock: endBlock
        };
        const logs = await chain.provider.getLogs(filter);
        withdrawLogs.push(...logs);
        console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
    }
    // parsing the logs to get the withdraw data
    const logPromises = withdrawLogs.map(async (log) => {
        const event = l2BridgeContract.interface.parseLog(log);
        const value = event.args.value;
        const hash = log.transactionHash;
        const messageStatus = await crossChainMessenger.getMessageStatus(hash);
        console.log(`Transaction Hash: ${log.transactionHash}`);
        console.log(`Value: ${event.args.value.toString()}`);
        console.log(`Withdraw Status: ${sdk_1.MessageStatus[messageStatus]}`);
        res.push({ hash, messageStatus, value });
    });
    await Promise.all(logPromises);
    return res;
}
exports.fetchOPBridgeTxs = fetchOPBridgeTxs;
// for a given OP stack L2 transaction hash, this function:
// 1. gets the status of the transaction
// 2. `proves` or `relays` the transaction if in ready state
async function proveOrRelayMessage(withdraws, crossChainMessenger) {
    for (const withdraw of withdraws) {
        if (withdraw.messageStatus === sdk_1.MessageStatus.READY_TO_PROVE) {
            console.log(`Proving tx ${withdraw.hash}`);
            await crossChainMessenger.proveMessage(withdraw.hash);
            withdraw.messageStatus = sdk_1.MessageStatus.READY_FOR_RELAY;
        }
        else if (withdraw.messageStatus === sdk_1.MessageStatus.READY_FOR_RELAY) {
            console.log(`Relaying tx ${withdraw.hash}`);
            await crossChainMessenger.finalizeMessage(withdraw.hash);
            withdraw.messageStatus = sdk_1.MessageStatus.RELAYED;
        }
    }
    return withdraws;
}
exports.proveOrRelayMessage = proveOrRelayMessage;
// Builds a slow sync result string from OP stack withdraws
async function buildOPReport(withdraws, chain) {
    let totalWei = ethers_1.BigNumber.from(0);
    let res = "";
    for (const withdraw of withdraws) {
        // only include withdraws that haven't been fully processed yet
        if (withdraw.messageStatus != sdk_1.MessageStatus.RELAYED) {
            totalWei = totalWei.add(withdraw.value);
            const withdrawBlockNumber = await chain.provider.getTransaction(withdraw.hash).then((tx) => tx.blockNumber);
            const block = await chain.provider.getBlock(withdrawBlockNumber);
            let expectedDate = (0, date_fns_1.addDays)(new Date(block.timestamp * 1000), 8);
            if (chain.name === 'blast') {
                // blast has a 13 day challenge period
                expectedDate = (0, date_fns_1.addDays)(new Date(block.timestamp * 1000), 13);
            }
            // add the withdraw data to a formatted string to be sent to discord
            const formattedDate = (0, date_fns_1.format)(expectedDate, 'MMMM do');
            const totalEther = parseFloat(ethers_1.utils.formatEther(withdraw.value)).toFixed(2);
            res += `${totalEther} ETH expected by ${formattedDate}\n`;
        }
    }
    const totalEther = parseFloat(ethers_1.utils.formatEther(totalWei)).toFixed(2);
    res = `${chain.name}: ${totalEther} total ETH \n---------------------------------------\n${res}\n`;
    console.log(res);
    return { totalWei, discordReport: res };
}
exports.buildOPReport = buildOPReport;
// sends a message to a discord webhook
async function sendDiscordMessage(message) {
    console.log(message);
    // try {
    //     await axios.post(DISCORD_WEBHOOK_URL, {
    //       username: 'Bridge Bot',
    //       content: message
    //     });
    // } catch (error) {
    //     console.error(`Failed to send message to discord: ${error}`);
    // }
}
exports.sendDiscordMessage = sendDiscordMessage;
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
// a generic function to filter for `sync` calls from `syncpool` to the bridge
async function fetchSyncPoolTxs(initialStartBlock, chain) {
    const blockInterval = 50000;
    let res = [];
    const latestBlockNumber = await chain.provider.getBlockNumber();
    for (let startBlock = initialStartBlock; startBlock <= latestBlockNumber; startBlock += blockInterval) {
        let endBlock = startBlock + blockInterval - 1;
        if (endBlock > latestBlockNumber) {
            endBlock = latestBlockNumber;
        }
        const filter = {
            address: chain.syncPoolAddress,
            topics: ["0xdb49c955bbc09ebed0b7337419bcbc9ce581910150a5b1f91159e653a0a4978e"],
            fromBlock: startBlock,
            toBlock: endBlock
        };
        const logs = await chain.provider.getLogs(filter);
        console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
        res.push(...logs);
    }
    return res;
}
exports.fetchSyncPoolTxs = fetchSyncPoolTxs;
