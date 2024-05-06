import { Wallet } from 'ethers';
import { CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs, proveOrRelayMessage } from '../helpers';
import { ChainInfo, PRIVATE_KEY, chains } from '../config';

// Configuring Blast Contracts
const ADDRESS_MANAGER = '0xE064B565Cf2A312a3e66Fe4118890583727380C0';
const L1_CROSS_DOMAIN_MESSENGER = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0';
const L1_STANDARD_BRIDGE = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524';
const OPTIMISM_PORTAL = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb';
const L2_OUTPUT_ORACLE = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76';
const BLAST_L2_MESSENGER_ADDRESS = '0x4200000000000000000000000000000000000007';
const BLAST_CHAIN_ID = 81457;

export async function blastSlowSync(chain: ChainInfo): Promise<void> {
    // TODO: decide on how to prune state
    const startBlockInitial = 2612000;

    const blastMessengerConfig: CrossChainMessengerConfig = {
        l2ChainId: BLAST_CHAIN_ID,
        l2Signer: new Wallet(PRIVATE_KEY, chain.provider),
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    }

    const blastMessenger = CreateCrossChainMessenger(blastMessengerConfig);

    const withdrawalTxs = await fetchOPBridgeTxs(startBlockInitial, BLAST_L2_MESSENGER_ADDRESS, chain.provider);

    await proveOrRelayMessage(withdrawalTxs, blastMessenger);
}
