import { Contract, constants, Wallet, utils, providers, BigNumber } from 'ethers';
import L2CrossDomainMessengerABI from './abis/L2CrossDomainMessenger.json';
import { CrossChainMessenger, MessageStatus } from '@eth-optimism/sdk';
import { ChainInfo, DISCORD_WEBHOOK_URL, L2_CROSS_DOMAIN_MESSENGER, MAINNET_WALLET } from './chains/config';
import axios from 'axios';

export interface CrossChainMessengerConfig {
  l2ChainId: number;
  l2Signer: Wallet;
  addressManager: string;
  l1CrossDomainMessenger: string;
  l1StandardBridge: string;
  optimismPortal: string;
  l2OutputOracle: string;
}

// Generating a CrossChainMessenger instance for a specific L2 chain
export function CreateCrossChainMessenger(chainConfig: CrossChainMessengerConfig): CrossChainMessenger {
    return new CrossChainMessenger({
        l1ChainId: 1,
        l2ChainId: chainConfig.l2ChainId,
        l1SignerOrProvider: MAINNET_WALLET,
        l2SignerOrProvider: chainConfig.l2Signer,
        contracts: {
          l1: {
          AddressManager: chainConfig.addressManager,
          L1CrossDomainMessenger: chainConfig.l1CrossDomainMessenger,
          L1StandardBridge: chainConfig.l1StandardBridge,
          OptimismPortal: chainConfig.optimismPortal,
          L2OutputOracle: chainConfig.l2OutputOracle,
      
          // Need to be set to zero for this version of the SDK.
          StateCommitmentChain: constants.AddressZero,
          CanonicalTransactionChain: constants.AddressZero,
          BondManager: constants.AddressZero,
          }
      }
    });
}

interface opWithdraw {
  hash: string;
  messageStatus: MessageStatus;
  value: BigNumber;
}

// The OP stack sdk methods for proving and relaying withdraws take the transaction hashes that initiated the withdraw as input. This function fetches
// all such hashes for a given L2 from a given `initialStartBlock`.
export async function fetchOPBridgeTxs(initialStartBlock: number, chain: ChainInfo, crossChainMessenger: CrossChainMessenger): Promise<opWithdraw[]> {
    // todo: potentially make this configurable?
    const blockInterval = 50000;
    const l2BridgeContract = new Contract(L2_CROSS_DOMAIN_MESSENGER, L2CrossDomainMessengerABI, chain.provider);

    let res: opWithdraw[] = [];
    const latestBlockNumber = await chain.provider.getBlockNumber();
    for (let startBlock = initialStartBlock; startBlock <= latestBlockNumber; startBlock += blockInterval) {
      let endBlock = startBlock + blockInterval - 1;
      if (endBlock > latestBlockNumber) {
        endBlock = latestBlockNumber;
      }

      const filter = {
        address: L2_CROSS_DOMAIN_MESSENGER,
        topics: [
          // event that gets emitted when the `syncpool` sends eth to the OP stack bridge
          l2BridgeContract.filters.SentMessageExtension1().topics![0],
          utils.hexZeroPad(chain.syncPoolAddress, 32),
        ],
        fromBlock: startBlock,
        toBlock: endBlock
      };

      const logs = await chain.provider.getLogs(filter);
        logs.forEach(async (log) => {
          const event = l2BridgeContract.interface.parseLog(log);
          const value = event.args.value;
          const hash = log.transactionHash;
          const messageStatus = await crossChainMessenger.getMessageStatus(hash);
          console.log(`Transaction Hash: ${log.transactionHash}`);
          console.log(`Value: ${event.args.value.toString()}`);
          console.log(`Withdraw Status: ${MessageStatus[messageStatus]}`);
          res.push({hash, messageStatus, value});
      });

      console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
    }
    return res
}

// for a given L2 transaction hash, this function:
// 1. gets the status of the transaction
// 2. `proves` or `relays` the transaction if in ready state
export async function proveOrRelayMessage(withdraws: opWithdraw[], crossChainMessenger: CrossChainMessenger): Promise<opWithdraw[]> {
  for (const withdraw of withdraws) {
    if (withdraw.messageStatus === MessageStatus.READY_TO_PROVE) {
      console.log(`Proving tx ${withdraw.hash}`);
      await crossChainMessenger.proveMessage(withdraw.hash);
      withdraw.messageStatus = MessageStatus.READY_FOR_RELAY;
    } else if (withdraw.messageStatus === MessageStatus.READY_FOR_RELAY) {
      console.log(`Relaying tx ${withdraw.hash}`);
      await crossChainMessenger.finalizeMessage(withdraw.hash);
      withdraw.messageStatus = MessageStatus.RELAYED;
    }
  }
  return withdraws;
}

// sends a message to a discord webhook
export async function sendDiscordMessage(message: string): Promise<void> {
  // try {
  //     await axios.post(DISCORD_WEBHOOK_URL, {
  //       username: 'Bridge Bot',
  //       content: message
  //     });
  // } catch (error) {
  //     console.error(`Failed to send message to discord: ${error}`);
  // }
}

// calculate start block for fetching bridge transactions
// blockTimeSeconds - how often blocks are produced in seconds (all OP stack chains have 2s block time)
// daysToIndex - The amount of days to index back for withdraw events
export async function calculateStartBlock(provider: providers.JsonRpcProvider, blockTimeSeconds: number, daysToIndex: number): Promise<number> {
  // calculate the amount of block
  const secondsToIndex = daysToIndex * 24 * 60 * 60;
  const blocksToIndex = Math.floor(secondsToIndex / blockTimeSeconds)

  const currentBlock = await provider.getBlockNumber();

  return Math.max(currentBlock - blocksToIndex, 0);
}
