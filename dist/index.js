"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const L2SyncPool_json_1 = __importDefault(require("./abis/L2SyncPool.json"));
const ethers_1 = require("ethers");
const config_1 = require("./chains/config");
const chains_1 = require("./chains");
const helpers_1 = require("./helpers");
async function handler() {
    console.log('Lambda function has started execution.');
    // check if EOA is running low on funds
    await eBegger(config_1.CHAINS);
    let totalEthPerChain = {};
    // Create a formatted message for Discord to append reporting data to:
    let discordMessage = '**ETH in Withdraw Process per Chain** \n--------------------------------------- ```';
    for (const chain of config_1.CHAINS) {
        console.log(`Processing transactions for chain: ${chain.name}`);
        // perform fast sync and slow sync for each chain and return any errors to discord
        try {
            // await performFastSync(chain);
            await (0, chains_1.performSlowSync)(chain);
        }
        catch (error) {
            console.log(`Error occurred while syncing ${chain.name}: ${error}.`);
            const truncatedError = error.toString().substring(0, 200);
            await (0, helpers_1.sendDiscordMessage)(`❗️❗️ **Alert:** Error occurred while syncing ${chain.name}.❗️❗️ \`\`\`${truncatedError}\`\`\``);
        }
    }
    Object.entries(totalEthPerChain).forEach(([chainName, ethAmount]) => {
        discordMessage += `${chainName}: ${ethAmount} ETH\n`;
    });
    discordMessage += '```';
    if (Object.keys(totalEthPerChain).length != 0) {
        await (0, helpers_1.sendDiscordMessage)(discordMessage);
    }
    console.log('All chains processed.');
}
exports.handler = handler;
// if the given L2 `syncPool` contract has over 1000 ETH, execute the `fast-sync` 
async function performFastSync(chain) {
    const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);
    console.log(`Sync pool balance for chain: ${chain.name} is ${ethers_1.utils.formatEther(syncPoolBalance)} ETH.`);
    if (syncPoolBalance.gt(ethers_1.utils.parseEther("1000"))) {
        console.log(`Executing fast sync for chain: ${chain.name}.`);
        const syncPool = new ethers_1.ethers.Contract(chain.syncPoolAddress, L2SyncPool_json_1.default, chain.provider);
        const syncPoolWithSigner = syncPool.connect(chain.wallet);
        const tokenIn = config_1.ETH_ADDRESS;
        const extraOptions = ethers_1.utils.arrayify("0x");
        const quoteResponse = await syncPool.quoteSync(tokenIn, extraOptions, false);
        const [nativeFee, lzTokenFee] = quoteResponse;
        const fee = { nativeFee, lzTokenFee };
        // TODO: add support for linea's sync call which requires that extraFee 
        const txResponse = await syncPoolWithSigner.sync(tokenIn, extraOptions, fee, {
            value: fee.nativeFee.toString(),
        });
        const receipt = await txResponse.wait();
        console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
    }
    else {
        console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${ethers_1.utils.formatEther(syncPoolBalance)} ETH in the sync pool.`);
    }
}
// begs for eth for any active chains where EOA is running low on funds
async function eBegger(chains) {
    const mainnetBalance = await config_1.MAINNET_PROVIDER.getBalance(config_1.MAINNET_WALLET.address);
    if (mainnetBalance.lt(ethers_1.utils.parseEther("0.02"))) {
        (0, helpers_1.sendDiscordMessage)(`❗️❗️ **Alert:** The bot wallet \`${config_1.MAINNET_WALLET.address}\` on mainnet is running low on ETH ❗️❗️`);
    }
    // L2
    for (const chain of chains) {
        const balance = await chain.provider.getBalance(chain.wallet.address);
        if (balance.lt(ethers_1.utils.parseEther("0.02"))) {
            (0, helpers_1.sendDiscordMessage)(`❗️❗️ **Alert:** The bot wallet \`${chain.wallet.address}\` is running low on ${chain.name} ETH ❗️❗️`);
        }
    }
}
handler();
