import { providers, Contract } from 'ethers';
import L2CrossDomainMessagerABI from '../abis/L2CrossDomainMessager.json';
import { CrossChainMessenger, MessageStatus } from '@eth-optimism/sdk';


// The OP stack sdk methods for proving and relaying withdraws take the transaction hashs that initiated the withdraw as input. This function fetches
// all such hashes for a given L2 from a given `initialStartBlock`.
export async function fetchOPBridgeTxs(initialStartBlock: number, l2MessengerAddress: string, l2Provider: providers.JsonRpcProvider ): Promise<string[]> {
    // todo: potentially make this configurable?
    const blockInterval = 50000;
    const l2BridgeContract = new Contract(l2MessengerAddress, L2CrossDomainMessagerABI, l2Provider);

    let hashes: string[] = [];

    try {
        const latestBlockNumber = await l2Provider.getBlockNumber();
        for (let startBlock = initialStartBlock; startBlock <= latestBlockNumber; startBlock += blockInterval) {
          let endBlock = startBlock + blockInterval - 1;
          if (endBlock > latestBlockNumber) {
            endBlock = latestBlockNumber;
          }
    
          const filter = {
            address: l2MessengerAddress,
            topics: [
              // event that gets emitted when the `syncpool` sents eth to the OP stack bridge
              l2BridgeContract.filters.SentMessageExtension1().topics![0],
              "0x00000000000000000000000052c4221cb805479954cde5accff8c4dcaf96623b"
            ],
            fromBlock: startBlock,
            toBlock: endBlock
          };
    
          const logs = await l2Provider.getLogs(filter);
          console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
          logs.forEach((log) => {
            hashes.push(log.transactionHash);
          });
        }
      } catch (error) {
      console.error(error);
    }

    return hashes;
}

// for a given L2 transaction hash, this function:
// 1. gets the status of the transaction
// 2. `proves` or `relays` the transaction if in ready state
export async function proveOrRelayMessage(txHash: string, crossChainMessenger: CrossChainMessenger, l2Provider: providers.JsonRpcProvider): Promise<void> {
    try {
      const curTxStatus = await crossChainMessenger.getMessageStatus(txHash);
      console.log(`Message ${txHash} status: ${curTxStatus}`);

      if (curTxStatus === MessageStatus.READY_TO_PROVE) {
        console.log(`Proving tx ${txHash}`);
        await crossChainMessenger.proveMessage(txHash);
      } else if (curTxStatus === MessageStatus.READY_FOR_RELAY) {
        console.log(`Relaying tx ${txHash}`);
        await crossChainMessenger.finalizeMessage(txHash);
      }

    } catch (error) {
      console.error(error);
    }
  return Promise.resolve();
}






