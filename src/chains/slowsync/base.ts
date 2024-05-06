import { Wallet } from 'ethers';
import { CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs, proveOrRelayMessage } from '../helpers';
import { ChainInfo, PRIVATE_KEY } from '../config';

// Configuring base contracts
const ADDRESS_MANAGER = '0x';
const L1_CROSS_DOMAIN_MESSENGER = '0x';
const L1_STANDARD_BRIDGE = '0x'; 
const OPTIMISM_PORTAL = '0x';
const L2_OUTPUT_ORACLE = '0x';

const BASE_L2_MESSENGER_ADDRESS = '0x'; 
const BASE_CHAIN_ID = 8453;  // Assuming chain ID needs to be defined as a constant

export async function baseSlowSync(chain: ChainInfo): Promise<void> {
    // TODO: Decide on how to prune state
    const startBlockInitial = 2612000;

    const baseMessengerConfig: CrossChainMessengerConfig = {
        l2ChainId: BASE_CHAIN_ID,
        l2Signer: new Wallet(PRIVATE_KEY, chain.provider),
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    }

    const baseMessenger = CreateCrossChainMessenger(baseMessengerConfig);

    const withdrawalTxs = await fetchOPBridgeTxs(startBlockInitial, BASE_L2_MESSENGER_ADDRESS, chain.provider);

    await proveOrRelayMessage(withdrawalTxs, baseMessenger);
}
