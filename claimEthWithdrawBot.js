require('dotenv').config();
const ethers = require('ethers');
const optimism = require('@eth-optimism/sdk');

// set up RPC providers, wallets and contract addresses
const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1_RPC_URL);
const blastProvider = new ethers.providers.JsonRpcProvider(process.env.BLAST_RPC_URL);
const l1Wallet = new ethers.Wallet(process.env.PRIVATE_KEY, l1Provider);

// configuring blast contracts
const BlastAddressManager = '0x0000000000000000000000000000000000000000' // blast doesn't include an address manager in their docs
const BlastL1CrossDomainMessenger = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0'
const BlastL1StandardBridge = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524' 
const BlastOptimismPortal = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb'
const BlastL2OutputOracle = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76'

// configure the blast messenger
const blastMessager = new optimism.CrossChainMessenger({
    l1ChainId: 1,
    l2ChainId: 81457,
    l1Signer: l1Wallet,
    l2Provider: blastProvider,

    contracts: {
        AddressManager: BlastAddressManager,
        L1CrossDomainMessenger: BlastL1CrossDomainMessenger,
        L1StandardBridge: BlastL1StandardBridge,
        OptimismPortal: BlastOptimismPortal,
        L2OutputOracle: BlastL2OutputOracle,
    
        // need to be set to zero for this verison of the sdk
        StateCommitmentChain: ethers.constants.AddressZero,
        CanonicalTransactionChain: ethers.constants.AddressZero,
        BondManager: ethers.constants.AddressZero,
    }
})

// todo: define how to find withdraws that are ready to be proved or finalized
const withdraws = ['0xd2661f661c100034844362e46deaeeab34b98393eac44adf1ea03912e449ed8f', '0xd2661f661c100034844362e46deaeeab34b98393eac44adf1ea03912e449ed8f']

for (let withdraw of withdraws) {

    let curMessageStatus = await blastMessager.getMessageStatus(withdraw);

    if (curMessageStatus === optimism.MessageStatus.READY_TO_PROVE) {
        await blastMessager.proveMessage(withdraw);
    } else if (curMessageStatus === optimism.MessageStatus.READY_FOR_RELAY) {
        await blastMessager.finalizeMessage(withdraw);
    }
}
