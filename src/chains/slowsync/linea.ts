import { ChainInfo } from "../config";
import { LineaSDK } from "@consensys/linea-sdk";
import { PRIVATE_KEY } from "../config";

export async function lineaSlowSync(chain: ChainInfo): Promise<number> {
    const startBlockInitial = 0;

    const sdk = new LineaSDK({
        l1RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
        l2RpcUrl: "https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52",
        l1SignerPrivateKey: PRIVATE_KEY,
        l2SignerPrivateKey: PRIVATE_KEY,
        network: "linea-mainnet",
        mode: "read-write",
    });



    return 0;
} 
