import L2SyncPool from "./abis/L2SyncPool.json";
import { ethers, utils } from "ethers";
import { ChainInfo, CHAINS, ETH_ADDRESS, MAINNET_PROVIDER, MAINNET_WALLET } from "./chains/config";
import { performSlowSync } from "./chains";
import { sendDiscordMessage } from "./helpers";

export async function handler(): Promise<void> {
  console.log('Lambda function has started execution.');

  // check if EOA is running low on funds
  await eBegger(CHAINS);

  let totalEthPerChain: Record<string, number> = {};

  // Create a formatted message for Discord to append reporting data to:
  let discordMessage = '**ETH in Withdraw Process per Chain** \n--------------------------------------- ```';

  for (const chain of CHAINS) {
    console.log(`Processing transactions for chain: ${chain.name}`);

    // perform fast sync and slow sync for each chain and return any errors to discord
    try {
      // await performFastSync(chain);
      await performSlowSync(chain);
    } catch (error) {
      console.log(`Error occurred while syncing ${chain.name}: ${error}.`)
      const truncatedError = (error as Error).toString().substring(0, 200); 
      await sendDiscordMessage(`❗️❗️ **Alert:** Error occurred while syncing ${chain.name}.❗️❗️ \`\`\`${truncatedError}\`\`\``);
    }
  }

  Object.entries(totalEthPerChain).forEach(([chainName, ethAmount]) => {
    discordMessage += `${chainName}: ${ethAmount} ETH\n`;
  });
  discordMessage += '```';
  if (Object.keys(totalEthPerChain).length != 0) {
    await sendDiscordMessage(discordMessage);
  }

  console.log('All chains processed.');
}

// if the given L2 `syncPool` contract has over 1000 ETH, execute the `fast-sync` 
async function performFastSync(chain: ChainInfo): Promise<void> {
  const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);

  console.log(`Sync pool balance for chain: ${chain.name} is ${utils.formatEther(syncPoolBalance)} ETH.`);

  if (syncPoolBalance.gt(utils.parseEther("1000"))) {
    console.log(`Executing fast sync for chain: ${chain.name}.`);

    const syncPool = new ethers.Contract(chain.syncPoolAddress, L2SyncPool, chain.provider);
    const syncPoolWithSigner = syncPool.connect(chain.wallet);

    const tokenIn = ETH_ADDRESS;
    const extraOptions = utils.arrayify("0x");
    const quoteResponse = await syncPool.quoteSync(tokenIn, extraOptions, false);
    const [nativeFee, lzTokenFee] = quoteResponse

    const fee = { nativeFee, lzTokenFee };
    
    // TODO: add support for linea's sync call which requires that extraFee 
    const txResponse = await syncPoolWithSigner.sync(tokenIn, extraOptions, fee, {
      value: fee.nativeFee.toString(),
    });

    const receipt = await txResponse.wait();
    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
  } else {
    console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${utils.formatEther(syncPoolBalance)} ETH in the sync pool.`);
  }
}

// begs for eth for any active chains where EOA is running low on funds
async function eBegger(chains: ChainInfo[]): Promise<void> {
  const mainnetBalance = await MAINNET_PROVIDER.getBalance(MAINNET_WALLET.address);
  if (mainnetBalance.lt(utils.parseEther("0.02"))) {
    sendDiscordMessage(`❗️❗️ **Alert:** The bot wallet \`${MAINNET_WALLET.address}\` on mainnet is running low on ETH ❗️❗️`);
  }
  
  // L2
  for (const chain of chains) {
    const balance = await chain.provider.getBalance(chain.wallet.address);
    if (balance.lt(utils.parseEther("0.02"))) {
      sendDiscordMessage(`❗️❗️ **Alert:** The bot wallet \`${chain.wallet.address}\` is running low on ${chain.name} ETH ❗️❗️`);
    }
  }
}

handler();