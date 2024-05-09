import { Wallet } from 'ethers';
import { calculateStartBlock, CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs, proveOrRelayMessage } from '../../helpers';
import { ChainInfo, PRIVATE_KEY } from '../config';

// Configuring base contracts
const ADDRESS_MANAGER = '0x8EfB6B5c4767B09Dc9AA6Af4eAA89F749522BaE2';
const L1_CROSS_DOMAIN_MESSENGER = '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa';
const L1_STANDARD_BRIDGE = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35'; 
const OPTIMISM_PORTAL = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e';
const L2_OUTPUT_ORACLE = '0x56315b90c40730925ec5485cf004d835058518A0';
const BASE_L2_MESSENGER_ADDRESS = '0x4200000000000000000000000000000000000007'; 
const BASE_CHAIN_ID = 8453; 

export async function baseSlowSync(chain: ChainInfo): Promise<number> {
    // TODO: Reduce to 10 days once we have cleared out the backlog
    const initialStartBlock = await calculateStartBlock(chain.provider, 2, 21)

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

    const { hashes, totalValue } = await fetchOPBridgeTxs(initialStartBlock, BASE_L2_MESSENGER_ADDRESS, chain);

    await proveOrRelayMessage(hashes, baseMessenger);

    return totalValue;
}
