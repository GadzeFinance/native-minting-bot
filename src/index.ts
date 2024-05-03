import { L2SyncPool } from "./abis";
import { ethers } from "ethers";

interface ChainInfo {
  name: string;
  provider: ethers.providers.JsonRpcProvider;
  syncPoolAddress: string;
  ethAddress: string;
}

const chains: ChainInfo[] = [
  {
    name: 'Blast',
    provider: new ethers.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
  },
  {
    name: 'Mode',
    provider: new ethers.providers.JsonRpcProvider('https://mainnet.mode.network'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  },
  {
    name: 'Base',
    provider: new ethers.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0x0"
  },
  {
    name: 'linea',
    provider: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0x0"
  },
];


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
    throw error; // Rethrowing the error ensures that Lambda marks the invocation as failed
  }
}

async function performFastSync(chain: ChainInfo): Promise<void> {

  console.log(`Executing fast sync for chain: ${chain.name}.`);

  const syncPoolBalance = await chain.provider.getBalance(chain.syncPoolAddress);

  if (syncPoolBalance.gt(ethers.utils.parseEther("1000"))) {
    console.log(`Executing fast sync for chain: ${chain.name}.`);

    const contract = new ethers.Contract(chain.syncPoolAddress, L2SyncPool, chain.provider);

    const extraOptions = ethers.utils.arrayify("0x");
    const fee = {
      nativeFee: ethers.utils.parseEther("0"),
      tokenFee: ethers.utils.parseEther("0")
    }

    try {
      const txResponse = await contract.sync(chain.ethAddress, extraOptions, fee);
      const receipt = await txResponse.wait();
      console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error(`Failed to execute sync: ${error}`);
    }
  }
}

