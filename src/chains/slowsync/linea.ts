
import { LineaSDK, Message, OnChainMessageStatus } from "@consensys/linea-sdk";
import { ChainInfo, PRIVATE_KEY } from "../config";
import { calculateStartBlock, fetchSyncPoolTxs } from "../../helpers";
import L2SyncPool from "../../abis/L2SyncPool.json"
import { BigNumber, utils } from "ethers";
import { addDays, format } from "date-fns";
import { SlowSyncResult } from "..";

const MessageSentABI = [{
    "anonymous": false,
    "inputs": [
        { "indexed": true, "internalType": "address", "name": "_from", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "_to", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "_fee", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "_value", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "_nonce", "type": "uint256" },
        { "indexed": false, "internalType": "bytes", "name": "_calldata", "type": "bytes" },
        { "indexed": true, "internalType": "bytes32", "name": "_messageHash", "type": "bytes32" }
    ],
    "name": "MessageSent",
    "type": "event"
}];

const lineaMessageSentInterface = new utils.Interface(MessageSentABI);

const syncPoolInterface = new utils.Interface(L2SyncPool)

const sdk = new LineaSDK({
    l1RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
    l2RpcUrl: 'https://linea-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52',
    l1SignerPrivateKey: PRIVATE_KEY,
    l2SignerPrivateKey: PRIVATE_KEY,
    network: "linea-mainnet",
    mode: "read-write",
});

const l2Contract = sdk.getL2Contract();
const l1ClaimingService = sdk.getL1ClaimingService();

export async function lineaSlowSync(chain: ChainInfo): Promise<SlowSyncResult> {
    const initialStartBlock = await calculateStartBlock(chain.provider, 2, 30);
    const withdraws = await fetchSyncPoolTxs(initialStartBlock, chain);


    let discordString = "";
    let totalWeiPending: BigNumber = BigNumber.from(0)
    
    for (const withdraw of withdraws) {
        console.log(`Transaction Hash: ${withdraw.transactionHash}`);
        // extracting the _messageHash from the logs
        const withdrawReceipt = await chain.provider.getTransactionReceipt(withdraw.transactionHash);
        const messageSentLog = lineaMessageSentInterface.parseLog(withdrawReceipt.logs[4]);
        const _messageHash = messageSentLog.args._messageHash;

        // extracting the withdraw amount from the logs
        const syncEvent = syncPoolInterface.parseLog(withdrawReceipt.logs[0]);
        const withdrawAmount = syncEvent.args.amountIn;
        console.log(`Value: ${withdrawAmount.toString()}`);
        
        // the _messageHash field is the input for the linea sdk methods
        let messageStatus = await l1ClaimingService.getMessageStatus(_messageHash);
        console.log(`Withdraw Status: ${messageStatus}`);
        
        // claim claimable withdraws
        if (messageStatus === OnChainMessageStatus.CLAIMABLE) {
            console.log(`Claiming withdraw ${withdraw}`)
            const message = await l2Contract.getMessageByMessageHash(_messageHash);
            await l1ClaimingService.claimMessage(message as Message);
            messageStatus = OnChainMessageStatus.CLAIMED;
        }

        // generate discord messages for all unclaimed withdraws
        if (messageStatus != OnChainMessageStatus.CLAIMED) {
            totalWeiPending = totalWeiPending.add(withdrawAmount);

            // get the expect arrival date of the withdraw
            const block = await chain.provider.getBlock(withdrawReceipt.blockNumber);
            let expectedDate = addDays(new Date(block.timestamp * 1000), 1); // zk withdraws should ready for relay in 1 day

            const formattedDate = format(expectedDate, 'MMMM do');
            const totalEther = parseFloat(utils.formatEther(withdrawAmount)).toFixed(2);
            discordString += `${totalEther} ETH expected by ${formattedDate}\n`;
        }
    }
    const totalEther = parseFloat(utils.formatEther(totalWeiPending)).toFixed(2);
    discordString = `linea: ${totalEther} total ETH \n---------------------------------------\n${discordString}\n`;
    
    console.log(discordString);
    return { totalWei: totalWeiPending, discordReport: discordString };
} 
