import { providers, Contract, utils } from 'ethers';
import L2CrossDomainMessagerABI from '../abis/L2CrossDomainMessager.json';
import { CrossChainMessage } from '@eth-optimism/sdk';


// The OP stack sdk methods for proving and relaying withdraws take the transaction hashs that initiated the withdraw as input. This function fetches
// all such hashes for a given L2 from a given `initialStartBlock`.
export async function fetchOPBridgeTxs(initialStartBlock: number, l2MessengerAddress: string, l2Provider: providers.JsonRpcProvider ): Promise<void> {
    // todo: potentially make this configurable?
    const blockInterval = 50000;
    const l2BridgeContract = new Contract(l2MessengerAddress, L2CrossDomainMessagerABI, l2Provider);

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
            const event = l2BridgeContract.interface.parseLog(log);
            console.log(`Transaction Hash: ${log.transactionHash}`);
            console.log(`Sender: ${event.args.sender}`);
            console.log(`Value: ${utils.formatEther(event.args.value)}`);
          });
        }
      } catch (error) {
        console.error(error);
    }
}

// for a given L2 transaction hash, this function:
// 1. gets the status of the transaction
// 2. `proves` or `relays` the transaction if in ready state
export async function proveOrRelayTx(txHash: string, CrossChainMessager: string, l2Provider: providers.JsonRpcProvider): Promise<void> {
    try {
        
        
    } catch (error) {
        console.error(error);
    }
}






