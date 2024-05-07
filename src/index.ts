import L2SyncPool from "./abis/L2SyncPool.json";
import { ethers, utils } from "ethers";
import { ChainInfo, chains, mainnetProvider, mainnetWallet } from "./chains/config";
import { performSlowSync } from "./chains";
import { sendDiscordMessage } from "./helpers";

export async function handler(): Promise<void> {
  try {
    console.log('Lambda function has started execution.');

    let totalEthPerChain: Record<string, number> = {};

    for (const chain of chains) {
      console.log(`Processing transactions for chain: ${chain.name}.`);
      
      await performFastSync(chain);

      const ethAmount = await performSlowSync(chain);
      totalEthPerChain[chain.name] = ethAmount;  // Store ETH amount for each chain
    }

    // Create a formatted message for Discord
    let discordMessage = '**ETH in Withdraw Process per Chain** \n--------------------------------------- ```';
    Object.entries(totalEthPerChain).forEach(([chainName, ethAmount]) => {
      discordMessage += `${chainName}: ${ethAmount} ETH\n`;
    });
    discordMessage += '```';

    await sendDiscordMessage(discordMessage);

    console.log('All transactions completed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// if the given L2 `syncPool` contract has over 1000 ETH, execute the `fast-sync` 
async function performFastSync(chain: ChainInfo): Promise<void> {

  const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);

  if (syncPoolBalance.gt(ethers.utils.parseEther("1000"))) {
    console.log(`Executing fast sync for chain: ${chain.name}.`);

    const syncPool = new ethers.Contract(chain.syncPoolAddress, L2SyncPool, chain.provider);
    const syncPoolWithSigner = syncPool.connect(chain.wallet);

    // params for the quote call 
    const tokenIn = chain.ethAddress;
    const extraOptions = utils.arrayify("0x");
    const payInLzToken = false;

    const quoteResponse = await syncPool.quoteSync(tokenIn, extraOptions, payInLzToken);

    const [nativeFeeRaw, tokenFeeRaw] = quoteResponse;
    
    const fee = {
      nativeFee: nativeFeeRaw,
      lzTokenFee: tokenFeeRaw
    }
    try {
      const txResponse = await syncPoolWithSigner.sync(chain.ethAddress, extraOptions, fee, {
        value: fee.nativeFee
      });
      const receipt = await txResponse.wait();
      console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error(`Failed to execute sync: ${error}`);
    }
  } else {
    console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${utils.formatEther(syncPoolBalance)} ETH in the liquidity pool`);
  }
}

// begs for eth for all active chains if EOA is running low on funds
async function eBegger(chains: ChainInfo[]): Promise<void> {
  const mainnetBalance = await mainnetProvider.getBalance(mainnetWallet.address);
  if (mainnetBalance.lt(utils.parseEther("1"))) {
    sendDiscordMessage(`**Alert:** The bot wallet \`${mainnetWallet.address}\` on mainnet is running low on ETH.`);
  }
  
  // L2
  for (const chain of chains) {
    const balance = await chain.provider.getBalance(chain.wallet.address);
    if (balance.lt(utils.parseEther("1"))) {
      sendDiscordMessage(`**Alert:** The bot wallet \`${chain.wallet.address}\` is running low on ${chain.name} ETH.`);
    }
  }
}

handler();