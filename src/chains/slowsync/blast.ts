import { MessageStatus } from '@eth-optimism/sdk';
import { buildOPReport, calculateStartBlock, CreateCrossChainMessenger, CrossChainMessengerConfig, fetchOPBridgeTxs } from '../../helpers';
import { ChainInfo, MAINNET_PROVIDER, MAINNET_WALLET } from '../config';
import { Contract, utils } from 'ethers';
import BlastEthYieldManger from '../../abis/BlastEthYieldManager.json'
import BlastOptimismPortal from '../../abis/BlastOptimismPortal.json'

// Blast specific interfaces
const BlastMessagePassedEvent = [
    "event MessagePassed(uint256 indexed nonce, address indexed sender, address indexed target, uint256 value, uint256 gasLimit, bytes data, bytes32 withdrawalHash)"
];

// Configuring Blast Contracts
const ADDRESS_MANAGER = '0xE064B565Cf2A312a3e66Fe4118890583727380C0';
const L1_CROSS_DOMAIN_MESSENGER = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0';
const L1_STANDARD_BRIDGE = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524';
const OPTIMISM_PORTAL = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb';
const L2_OUTPUT_ORACLE = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76';
const BLAST_ETH_YIELD_MANAGER = '0x98078db053902644191f93988341E31289E1C8FE';
const BLAST_CHAIN_ID = 81457;

const blastMessagePassedInterface = new utils.Interface(BlastMessagePassedEvent);
const blastOptimismPortalContract = new Contract(OPTIMISM_PORTAL, BlastOptimismPortal, MAINNET_WALLET);
const blastEthYieldManagerContract = new Contract(BLAST_ETH_YIELD_MANAGER, BlastEthYieldManger, MAINNET_PROVIDER);

export async function blastSlowSync(chain: ChainInfo): Promise<string> {
    const blastMessengerConfig: CrossChainMessengerConfig = {
        l2ChainId: BLAST_CHAIN_ID,
        l2Signer: chain.wallet,
        addressManager: ADDRESS_MANAGER,
        l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER,
        l1StandardBridge: L1_STANDARD_BRIDGE,
        optimismPortal: OPTIMISM_PORTAL,
        l2OutputOracle: L2_OUTPUT_ORACLE
    }
    const blastMessenger = CreateCrossChainMessenger(blastMessengerConfig);

    // TODO: Reduce to 17 days once we have cleared out the backlog
    const initialStartBlock = await calculateStartBlock(chain.provider, 2, 21)
    const withdraws = await fetchOPBridgeTxs(initialStartBlock, chain, blastMessenger)

    // Blast is a OP stack chain, but additional inputs are required for finalizing messages due to yield management
    for (const withdraw of withdraws) {
        if (withdraw.messageStatus === MessageStatus.READY_TO_PROVE) {
            console.log("Proving message: ", withdraw.hash);
            await blastMessenger.proveMessage(withdraw.hash);
            withdraw.messageStatus = MessageStatus.READY_FOR_RELAY;
        } else if (withdraw.messageStatus === MessageStatus.READY_FOR_RELAY) {
            console.log("Relaying message: ", withdraw.hash);
            // extract the withdraw hash from the events log (this is not a transaction hash, but a hash of the transaction data)
            const receipt = await blastMessenger.l2Provider.getTransactionReceipt(withdraw.hash);
            const log = blastMessagePassedInterface.parseLog(receipt.logs[4]);
            const withdrawHash = log.args.withdrawalHash;
            console.log("Withdraw hash: ", withdrawHash);

            // use withdraw hash to determine the `hintID`
            const provenWithdrawData = await blastOptimismPortalContract.provenWithdrawals(withdrawHash);
            console.log("Proven Withdraw Data: ", provenWithdrawData.requestId.toString());
            const lastHintId = await blastEthYieldManagerContract.getLastCheckpointId();
            const WithdrawHintId = await blastEthYieldManagerContract.findCheckpointHint(provenWithdrawData.requestId, 10, lastHintId);

            // construct inputs for the blast `finalizeMessage` call
            const crossChainMessage = await blastMessenger.toCrossChainMessage(withdraw.hash, 0);
            const lowLevelMessage = await blastMessenger.toLowLevelMessage(crossChainMessage, 0);

            const withdrawalTx = {
                nonce: lowLevelMessage.messageNonce,
                sender: lowLevelMessage.sender,
                target: lowLevelMessage.target,
                value: lowLevelMessage.value,
                gasLimit: lowLevelMessage.minGasLimit,
                data: lowLevelMessage.message
            };

            await blastOptimismPortalContract.finalizeWithdrawalTransaction(WithdrawHintId, withdrawalTx);
            withdraw.messageStatus = MessageStatus.READY_TO_PROVE;
        }
    }

    const reportString = await buildOPReport(withdraws, chain);
    return "blast";
}
