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
    try {
        console.log('Lambda function has started execution.');
        let totalEthPerChain = {};
        for (const chain of config_1.chains) {
            console.log(`Processing transactions for chain: ${chain.name}.`);
            await performFastSync(chain);
            const ethAmount = await (0, chains_1.performSlowSync)(chain);
            totalEthPerChain[chain.name] = ethAmount; // Store ETH amount for each chain
        }
        // Create a formatted message for Discord
        let discordMessage = '**ETH in Withdraw Process per Chain** \n ------------------------------------ ```';
        Object.entries(totalEthPerChain).forEach(([chainName, ethAmount]) => {
            discordMessage += `${chainName}: ${ethAmount} ETH\n`;
        });
        discordMessage += '```';
        await (0, helpers_1.sendDiscordMessage)(discordMessage);
        console.log('All transactions completed successfully.');
    }
    catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}
exports.handler = handler;
// if the given L2 `syncPool` contract has over 1000 ETH, execute the `fast-sync` 
async function performFastSync(chain) {
    const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);
    if (syncPoolBalance.gt(ethers_1.ethers.utils.parseEther("1000"))) {
        console.log(`Executing fast sync for chain: ${chain.name}.`);
        const syncPool = new ethers_1.ethers.Contract(chain.syncPoolAddress, L2SyncPool_json_1.default, chain.provider);
        const syncPoolWithSigner = syncPool.connect(chain.wallet);
        // params for the quote call 
        const tokenIn = chain.ethAddress;
        const extraOptions = ethers_1.utils.arrayify("0x");
        const payInLzToken = false;
        const quoteResponse = await syncPool.quoteSync(tokenIn, extraOptions, payInLzToken);
        const [nativeFeeRaw, tokenFeeRaw] = quoteResponse;
        const fee = {
            nativeFee: nativeFeeRaw,
            lzTokenFee: tokenFeeRaw
        };
        try {
            const txResponse = await syncPoolWithSigner.sync(chain.ethAddress, extraOptions, fee, {
                value: fee.nativeFee
            });
            const receipt = await txResponse.wait();
            console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
        }
        catch (error) {
            console.error(`Failed to execute sync: ${error}`);
        }
    }
    else {
        console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${ethers_1.utils.formatEther(syncPoolBalance)} ETH in the liquidity pool`);
    }
}
// begs for eth for all active chains if EOA is running low on funds
async function eBegger(chains) {
    const mainnetBalance = await config_1.mainnetProvider.getBalance(config_1.mainnetWallet.address);
    if (mainnetBalance.lt(ethers_1.utils.parseEther("1"))) {
        (0, helpers_1.sendDiscordMessage)(`**Alert:** The bot wallet \`${config_1.mainnetWallet.address}\` on mainnet is running low on ETH.`);
    }
    // L2
    for (const chain of chains) {
        const balance = await chain.provider.getBalance(chain.wallet.address);
        if (balance.lt(ethers_1.utils.parseEther("1"))) {
            (0, helpers_1.sendDiscordMessage)(`**Alert:** The bot wallet \`${chain.wallet.address}\` is running low on ${chain.name} ETH.`);
        }
    }
}
handler();
