
import { LineaSDK, Message, OnChainMessageStatus } from "@consensys/linea-sdk";
import { ChainInfo, PRIVATE_KEY } from "../config";
import { calculateStartBlock, fetchSyncPoolTxs } from "../../helpers";

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

interface LineaTransaction {
    transactionHash: string;
    withdrawHash: string;
}

export async function lineaSlowSync(chain: ChainInfo): Promise<string> {
    // todo: filter to get all of the linea transaction hashes and the withdrawHash that is emitted from said contract
    let lineaTransactions: LineaTransaction[] = [];
    
    const initialStartBlock = await calculateStartBlock(chain.provider, 2, 10);
    const withdraws = await fetchSyncPoolTxs(initialStartBlock, chain);


    for (const transaction of lineaTransactions) {
        const messageStatus = await l1ClaimingService.getMessageStatus(transaction.transactionHash);
        if (messageStatus == OnChainMessageStatus.CLAIMABLE) {
            const message = await l2Contract.getMessageByMessageHash(transaction.withdrawHash);
            await l1ClaimingService.claimMessage(message as Message);
        }
    }

    return "value";
} 
