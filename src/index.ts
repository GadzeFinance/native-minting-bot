import L2SyncPool from "./abis/L2SyncPool.json";
import { ethers, utils } from "ethers";
import { ChainInfo, chains } from "./chains/config";
import { performSlowSync } from "./chains";

export async function handler(): Promise<void> {
  try {
    console.log('Lambda function has started execution.');

    for (const chain of chains) {
      console.log(`Processing transactions for chain: ${chain.name}.`)

      await performFastSync(chain);

      await performSlowSync(chain);
    }

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

    console.log(`Native Fee Raw: ${nativeFeeRaw}`);  // Log the raw input
    console.log(`Native Fee in Wei: ${fee.nativeFee.toString()}`);  // Log the converted wei value


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

handler();