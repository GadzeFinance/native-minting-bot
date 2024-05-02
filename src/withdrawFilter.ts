import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

interface ChainUrls {
  [chain: string]: string;
}

// Enum to manage different chain types
enum Chain {
  Mainnet = "Mainnet",
  Rinkeby = "Rinkeby",
  // add other networks as necessary
}

// URLs for different networks (assuming these are defined in your .env)
const CHAIN_URLS: ChainUrls = {
  [Chain.Mainnet]: process.env.MAINNET_URL!,
  [Chain.Rinkeby]: process.env.RINKEBY_URL!,
};

// Load ABI and setup constants
const blastL2MessengerABI = require('./L1CrossDomainMessagerABI.json');
const blastL2MessengerAddress = '0x4200000000000000000000000000000000000007'; 
const startBlockInitial = 2612000;
const blockInterval = 50000;

// Function to fetch logs based on chain type
async function fetchLogsByChain(chain: Chain): Promise<void> {
  const providerUrl = CHAIN_URLS[chain];
  if (!providerUrl) {
    console.error("Invalid chain type or URL not found in configuration.");
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const contract = new ethers.Contract(blastL2MessengerAddress, blastL2MessengerABI, provider);

  try {
    const latestBlockNumber = await provider.getBlockNumber();
    for (let startBlock = startBlockInitial; startBlock <= latestBlockNumber; startBlock += blockInterval) {
      let endBlock = startBlock + blockInterval - 1;
      if (endBlock > latestBlockNumber) {
        endBlock = latestBlockNumber;
      }

      const filter = {
        address: blastL2MessengerAddress,
        topics: [
          // event that gets emitted when the `syncpool` sents eth to the OP stack bridge
          contract.filters.SentMessageExtension1().topics![0],
          "0x00000000000000000000000052c4221cb805479954cde5accff8c4dcaf96623b"
        ],
        fromBlock: startBlock,
        toBlock: endBlock
      };

      const logs = await provider.getLogs(filter);
      console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
      logs.forEach((log) => {
        const event = contract.interface.parseLog(log);
        console.log(`Transaction Hash: ${log.transactionHash}`);
        console.log(`Sender: ${event.args.sender}`);
        console.log(`Value: ${ethers.utils.formatEther(event.args.value)}`);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

// Example usage
fetchLogsByChain(Chain.Mainnet);
