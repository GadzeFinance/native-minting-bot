
import { LineaSDK, Message, OnChainMessageStatus } from "@consensys/linea-sdk";
import { ChainInfo, PRIVATE_KEY } from "../config";
import { calculateStartBlock, fetchSyncPoolTxs } from "../../helpers";
import { utils } from "ethers";

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

export async function lineaSlowSync(chain: ChainInfo): Promise<string> {
    const initialStartBlock = await calculateStartBlock(chain.provider, 2, 10);
    const withdraws = await fetchSyncPoolTxs(initialStartBlock, chain);

    // extract the _messageHash from the logs to be used in the `getMessageByMessageHash` method
    let lineaMessageHashes: string[] = [];
    for (const withdraw of withdraws) {
        const withdrawReceipt = await chain.provider.getTransactionReceipt(withdraw.transactionHash);
        const messageSentLog = lineaMessageSentInterface.parseLog(withdrawReceipt.logs[4]);
        lineaMessageHashes.push(messageSentLog.args._messageHash);
    }

    for (const messageHash of lineaMessageHashes) {
        const messageStatus = await l1ClaimingService.getMessageStatus(messageHash);
        if (messageStatus == OnChainMessageStatus.CLAIMABLE) {
            const message = await l2Contract.getMessageByMessageHash(messageHash);
            await l1ClaimingService.claimMessage(message as Message);
        }
    }

    return "value";
} 
