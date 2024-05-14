import { Wallet } from 'ethers';
import { calculateStartBlock, CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs, proveOrRelayMessage } from '../../helpers';
import { ChainInfo, PRIVATE_KEY } from '../config';

// configuring mode contracts
const ADDRESS_MANAGER = '0x50eF494573f28Cad6B64C31b7a00Cdaa48306e15';
const L1_CROSS_DOMAIN_MESSENGER = '0x95bDCA6c8EdEB69C98Bd5bd17660BaCef1298A6f';
const L1_STANDARD_BRIDGE = '0x735aDBbE72226BD52e818E7181953f42E3b0FF21'; 
const OPTIMISM_PORTAL = '0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07';
const L2_OUTPUT_ORACLE = '0x4317ba146D4933D889518a3e5E11Fe7a53199b04';




const MODE_CHAIN_ID = 34443;

export async function modeSlowSync(chain: ChainInfo): Promise<string> {
    // TODO: Reduce to 10 days once we have cleared out the backlog
    const initialStartBlock = await calculateStartBlock(chain.provider, 2, 21)

    const modeMessengerConfig: CrossChainMessengerConfig = {
        l2ChainId: MODE_CHAIN_ID,
        l2Signer: new Wallet(PRIVATE_KEY, chain.provider),
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    }

    const modeMessenger = CreateCrossChainMessenger(modeMessengerConfig);

    let withdraws = await fetchOPBridgeTxs(initialStartBlock, chain, modeMessenger);

    withdraws =  await proveOrRelayMessage(withdraws, modeMessenger);

    return "something bro";
}
