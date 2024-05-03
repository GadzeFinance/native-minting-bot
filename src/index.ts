import { L2SyncPool } from "./abis";
import { BigNumber, ethers, utils, providers } from "ethers";
import { ChainInfo, chains } from "./chains/config";

export async function handler(): Promise<void> {
  try {
    console.log('Lambda function has started execution.');

    for (const chain of chains) {
      console.log(`Processing transactions for chain: ${chain.name}.`)

      await performFastSync(chain);

      // await performSlowSync(chain);
    }

    console.log('All transactions completed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// if the given L2 `syncPool` contract has over 1000 ETH, execute the `fast-sync` 
async function performFastSync(chain: ChainInfo): Promise<void> {

  console.log(`Executing fast sync for chain: ${chain.name}.`);

  const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);

  if (syncPoolBalance.gt(ethers.utils.parseEther("1000"))) {
    console.log(`Executing fast sync for chain: ${chain.name}.`);

    const contract = new ethers.Contract(chain.syncPoolAddress, L2SyncPool, chain.provider);

    const nativeFee = await calculateLzFee();

    const extraOptions = ethers.utils.arrayify("0x");
    const fee = {
      nativeFee,
      tokenFee: ethers.utils.parseEther("0")
    }

    try {
      const txResponse = await contract.sync(chain.ethAddress, extraOptions, fee);
      const receipt = await txResponse.wait();
      console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error(`Failed to execute sync: ${error}`);
    }
  } else {
    console.log(`Skipping fast sync for chain: ${chain.name}. Only has ${utils.formatEther(syncPoolBalance)} ETH in the lquidity pool`);
  }
}

// caclucates the fee for the execution of the `fast-sync` on mainnet
async function calculateLzFee(): Promise<BigNumber> {
  return ethers.utils.parseEther("0.1");
}
