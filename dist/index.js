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
async function handler() {
    try {
        console.log('Lambda function has started execution.');
        for (const chain of config_1.chains) {
            console.log(`Processing transactions for chain: ${chain.name}.`);
            // await performFastSync(chain);
            await (0, chains_1.performSlowSync)(chain);
        }
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
        const contract = new ethers_1.ethers.Contract(chain.syncPoolAddress, L2SyncPool_json_1.default, chain.provider);
        const nativeFee = await calculateLzFee();
        const extraOptions = ethers_1.ethers.utils.arrayify("0x");
        const fee = {
            nativeFee,
            tokenFee: ethers_1.ethers.utils.parseEther("0")
        };
        try {
            const txResponse = await contract.sync(chain.ethAddress, extraOptions, fee);
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
// calculates the fee for the execution of the `fast-sync` on mainnet
async function calculateLzFee() {
    return ethers_1.ethers.utils.parseEther("0.1");
}
handler();
