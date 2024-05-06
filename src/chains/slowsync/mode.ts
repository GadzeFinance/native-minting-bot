import { Wallet } from 'ethers';
import { CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs, proveOrRelayMessage } from '../helpers';
import { ChainInfo, PRIVATE_KEY, chains } from '../config';

// Mode Contracts
const ADDRESS_MANAGER = '';
const L1_CROSS_DOMAIN_MESSENGER = '';
const L1_STANDARD_BRIDGE = '';
const OPTIMISM_PORTAL = '';
const L2_OUTPUT_ORACLE = '';
const MODE_L2_MESSENGER_ADDRESS = '';

const MODE_CHAIN_ID = 34443;


export async function modeSlowSync(chain: ChainInfo): Promise<void> {
    // todo: decide on how to prune state
    const startBlockInitial = 2612000;

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

    const withdrawalTxs = await fetchOPBridgeTxs(startBlockInitial, MODE_L2_MESSENGER_ADDRESS, chain.provider);

    await proveOrRelayMessage(withdrawalTxs, modeMessenger);
}
