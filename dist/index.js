"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const config_1 = require("./chains/config");
const chains_1 = require("./chains");
async function handler() {
    console.log('Lambda function has started execution.');
    // await eBegger(CHAINS);
    // let totalEthPerChain: Record<string, number> = {};
    for (const chain of config_1.CHAINS) {
        console.log(`Processing transactions for chain: ${chain.name}`);
        await (0, chains_1.performSlowSync)(chain);
        // perform fast sync and slow sync for each chain and return any errors to discord
        // try {
        //   await performFastSync(chain);
        //   totalEthPerChain[chain.name] = await performSlowSync(chain);
        // } catch (error) {
        //   console.log(`Error occurred while syncing ${chain.name}: ${error}.`)
        //   const truncatedError = (error as Error).toString().substring(0, 200); 
        //   await sendDiscordMessage(`❗️❗️ **Alert:** Error occurred while syncing ${chain.name}.❗️❗️ \`\`\`${truncatedError}\`\`\``);
        // }
    }
    // await findChallengePeriodEth();
    // Create a formatted message for Discord
    // let discordMessage = '**ETH in Withdraw Process per Chain** \n--------------------------------------- ```';
    // Object.entries(totalEthPerChain).forEach(([chainName, ethAmount]) => {
    //   discordMessage += `${chainName}: ${ethAmount} ETH\n`;
    // });
    // discordMessage += '```';
    // if (Object.keys(totalEthPerChain).length != 0) {
    //   await sendDiscordMessage(discordMessage);
    // }
    console.log('All chains processed.');
}
exports.handler = handler;
// if the given L2 `syncPool` contract has over 1000 ETH, execute the `fast-sync` 
// async function performFastSync(chain: ChainInfo): Promise<void> {
//   const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);
//   console.log(`Sync pool balance for chain: ${chain.name} is ${utils.formatEther(syncPoolBalance)} ETH.`);
//   if (syncPoolBalance.gt(utils.parseEther("400"))) {
//     console.log(`Executing fast sync for chain: ${chain.name}.`);
//     const syncPool = new ethers.Contract(chain.syncPoolAddress, L2SyncPool, chain.provider);
//     const syncPoolWithSigner = syncPool.connect(chain.wallet);
//     const tokenIn = ETH_ADDRESS;
//     const extraOptions = utils.arrayify("0x");
//     const quoteResponse = await syncPool.quoteSync(tokenIn, extraOptions, false);
//     const [nativeFee, lzTokenFee] = quoteResponse
//     const fee = { nativeFee, lzTokenFee };
//     const txResponse = await syncPoolWithSigner.sync(tokenIn, extraOptions, fee, {
//       value: fee.nativeFee.toString(),
//     });
//     const receipt = await txResponse.wait();
//     console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
//   } else {
//     console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${utils.formatEther(syncPoolBalance)} ETH in the sync pool.`);
//   }
// }
// begs for eth for any active chains where EOA is running low on funds
// async function eBegger(chains: ChainInfo[]): Promise<void> {
//   const mainnetBalance = await MAINNET_PROVIDER.getBalance(MAINNET_WALLET.address);
//   if (mainnetBalance.lt(utils.parseEther("0.02"))) {
//     sendDiscordMessage(`❗️❗️ **Alert:** The bot wallet \`${MAINNET_WALLET.address}\` on mainnet is running low on ETH ❗️❗️`);
//   }
//   // L2
//   for (const chain of chains) {
//     const balance = await chain.provider.getBalance(chain.wallet.address);
//     if (balance.lt(utils.parseEther("0.02"))) {
//       sendDiscordMessage(`❗️❗️ **Alert:** The bot wallet \`${chain.wallet.address}\` is running low on ${chain.name} ETH ❗️❗️`);
//     }
//   }
// }
// generates a report of the ETH in the challenge period for each china and the expected claim date
// 1. filters through the EOA transactions to find the proof submissions
// 2. based of the length of the challenge period for the chain, calculates the expected claim date
async function generateReport() {
}
handler();
