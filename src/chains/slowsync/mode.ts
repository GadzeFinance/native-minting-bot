import { Wallet } from 'ethers';
import { calculateStartBlock, CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs, proveOrRelayMessage } from '../../helpers';
import { ChainInfo, PRIVATE_KEY } from '../config';

// Mode Contracts
const ADDRESS_MANAGER = '';
const L1_CROSS_DOMAIN_MESSENGER = '';
const L1_STANDARD_BRIDGE = '';
const OPTIMISM_PORTAL = '';
const L2_OUTPUT_ORACLE = '';
const MODE_L2_MESSENGER_ADDRESS = '0xC0d3c0d3c0D3c0D3C0d3C0D3C0D3c0d3c0d30007';

const MODE_CHAIN_ID = 34443;

export async function modeSlowSync(chain: ChainInfo): Promise<number> {
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

    const { hashes, totalValue } = await fetchOPBridgeTxs(initialStartBlock, MODE_L2_MESSENGER_ADDRESS, chain);

    await proveOrRelayMessage(hashes, modeMessenger);

    return totalValue;
}
