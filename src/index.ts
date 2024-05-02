import { L2SyncPool } from "./abis";
import { ethers } from "ethers";

interface ChainInfo {
  name: string;
  provider: ethers.providers.JsonRpcProvider;
  syncPoolAddress: string;
}

const chains: ChainInfo[] = [
  {
    name: 'Blast',
    provider: new ethers.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
  },
  {
    name: 'Mode',
    provider: 'https://mainnet.mode.network',
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
  },
];


export async function handler(): Promise<void> {
  try {
    console.log('Lambda function has started execution.');

    const chainClients = setupChainClients();

    for (const chain of chainClients) {
      console.log(`Processing transactions for chain: ${chain.chainType}.`)

    
      await performFastSync(chain);

      await performSlowSync(chain);
    }

    console.log('All transactions completed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
    throw error; // Rethrowing the error ensures that Lambda marks the invocation as failed
  }
}

async function performFastSync(chain: ChainClient): Promise<void> {

  

  console.log(`Starting fast sync for chain: ${chain.chainType}.`);

  // Perform fast sync operations here
}

