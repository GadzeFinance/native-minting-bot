import L2SyncPool from "./abis/L2SyncPool.json";
import DummyToken from "./abis/DummyToken.json";
import { BigNumber, ethers, utils } from "ethers";
import { ChainInfo, CHAINS, ETH_ADDRESS, MAINNET_PROVIDER, MAINNET_WALLET } from "./chains/config";
import { performSlowSync } from "./chains";
import { sendDiscordMessage, truncateError } from "./helpers";

export async function handler(): Promise<void> {
  console.log('Lambda function has started execution.');

  const gasPrice = await MAINNET_PROVIDER.getGasPrice();
  const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, 'gwei');

  if (parseFloat(gasPriceInGwei) > 25) {
    console.log(`Mainnet gas price is too high: ${gasPriceInGwei} Gwei. Bot will not execute transactions.`);
    await standby(CHAINS);
    return
  }

  // check if EOA is running low on funds
  await eBegger(CHAINS);

  const bridgeBalances: BridgeBalances = {};

  // Create a formatted message for Discord to append reporting data to:
  let discordMessage = '**ETH in Withdraw Process per Chain** \n```';

  for (const chain of CHAINS) {
    console.log(`Processing transactions for chain: ${chain.name}`);
    // perform fast sync and slow sync for each chain and return any errors to discord
    
    try {
      await performFastSync(chain);
      const slowSyncResult =  await performSlowSync(chain);
      discordMessage += slowSyncResult.discordReport;
      bridgeBalances[chain.name] = slowSyncResult.totalWei;
    } catch (error) {
      console.log(`Error occurred while syncing ${chain.name}: ${error}.`);
      bridgeBalances[chain.name] = undefined;
      await sendDiscordMessage(`❗️❗️ **Alert:** Error occurred while syncing ${chain.name}.❗️❗️ \`\`\`${truncateError(error)}\`\`\``);
    }
  }

  // wait for 5 minutes to get time for mainnet and L2 state to sync before checking the invariant
  await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

  // check if dummy ETH invariant is broken for each chain
  await checkDummyETH(CHAINS, bridgeBalances);

  await sendDiscordMessage(discordMessage + '```');

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
    const [nativeFee, lzTokenFee] = quoteResponse as [BigNumber, BigNumber];

    // LayerZero fee to be sent with the transaction to relay the message to the L1
    const fee = { nativeFee, lzTokenFee };
    
    // some chains have additional fees to be paid to the canonical bridge for fast sync
    const syncFee = chain.name === 'linea' 
      ? utils.parseEther("0.0001").add(fee.nativeFee)
      : fee.nativeFee;
    
    // Increase the estimated gas by 10% for sync transaction call
    const syncEstimatedGas = await syncPoolWithSigner.estimateGas.sync(tokenIn, extraOptions, fee, {
      value: syncFee,
    });
    const modifiedGasLimit = syncEstimatedGas.add(syncEstimatedGas.mul(10).div(100));

    const txResponse = await syncPoolWithSigner.sync(tokenIn, extraOptions, fee, {
      value: syncFee,
      gasLimit: modifiedGasLimit
    });
    
    const receipt = await txResponse.wait();
    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
  } else {
    console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${utils.formatEther(syncPoolBalance)} ETH in the sync pool.`);
  }
}

// begs for eth for any active chains where EOA is running low on funds
async function eBegger(chains: ChainInfo[]): Promise<void> {
  try {
    const mainnetBalance = await MAINNET_PROVIDER.getBalance(MAINNET_WALLET.address);
    if (mainnetBalance.lt(utils.parseEther("0.03"))) {
      sendDiscordMessage(`❗️❗️ **Alert:** The bot wallet \`${MAINNET_WALLET.address}\` on mainnet is running low on ETH ❗️❗️`);
    }
    
    // L2
    for (const chain of chains) {
      const balance = await chain.provider.getBalance(chain.wallet.address);
      if (balance.lt(utils.parseEther("0.03"))) {
        sendDiscordMessage(`❗️❗️ **Alert:** The bot wallet \`${chain.wallet.address}\` is running low on ${chain.name} ETH ❗️❗️`);
      }
    }
  } catch (error) {
    console.log(`Error occurred while checking EOA balance: ${error}.`);
    sendDiscordMessage(`❗️❗️ **Alert:** Error occurred while checking EOA balance.❗️❗️ \`\`\`${truncateError(error)}\`\`\``);
  }
}

interface BridgeBalances {
  [key: string]: BigNumber | undefined;
}

// checks the invariant for each chain that `dummyETH.TotalSupply` == `ETH in Withdraw Process`
async function checkDummyETH(chains: ChainInfo[], bridgeBalances: BridgeBalances): Promise<void> {
  for (const chain of chains) {
    try {
      console.log(`Checking dummy ETH invariant for chain: ${chain.name}.`);
      if (!bridgeBalances[chain.name]) {
        console.log(`Skipping dummy ETH invariant check for chain: ${chain.name}.`);
        continue;
      }

      const dummyEthContract = new ethers.Contract(chain.dummyEthAddress, DummyToken, MAINNET_PROVIDER);
      const dummyEthSupply = await dummyEthContract.totalSupply();
      const bridgeBalance = bridgeBalances[chain.name];
      const difference = dummyEthSupply.sub(bridgeBalance).abs();
  
      
      if (difference.gte(utils.parseEther("1"))) {
        sendDiscordMessage(`❗️❗️ **Alert:** Invariant for ${chain.name} is broken. Dummy ETH total supply is ${parseFloat(utils.formatEther(dummyEthSupply)).toFixed(2)} but the bridge balance is ${bridgeBalance ? parseFloat(utils.formatEther(bridgeBalance)).toFixed(2) : "undefined" } ❗️❗️`);
      }
    } catch (error) {
      console.log(`Error occurred while checking dummy ETH invariant for chain: ${chain.name}. ${error}.`);
      sendDiscordMessage(`❗️❗️ **Alert:** Error occurred while checking dummy ETH invariant for chain: ${chain.name}.❗️❗️ \`\`\`${truncateError(error)}\`\`\``);
    }
  }
}

// function that runs when the bot is in standby mode not processing withdrawals
async function standby(chains: ChainInfo[]): Promise<void> {
  let standbyMessage = '**Standby Mode (Sync Pool Balance By Chain)** \n```';
  for (const chain of chains) {
    const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);
    standbyMessage += `${chain.name}: ${utils.formatEther(syncPoolBalance)} ETH\n`;
  }
  standbyMessage += '```';
  sendDiscordMessage(standbyMessage);
}

handler();
