require('dotenv').config();
const ethers = require('ethers');
const optimism = require('@eth-optimism/sdk');

// set up RPC providers, wallets and contract addresses
const l1Provider = new ethers.providers.JsonRpcProvider(process.env.MAINNET_RPC);
const blastProvider = new ethers.providers.JsonRpcProvider(process.env.BLAST_RPC_URL);
const l1Wallet = new ethers.Wallet(process.env.PRIVATE_KEY, l1Provider);
const l2Wallet = new ethers.Wallet(process.env.PRIVATE_KEY, blastProvider);

// configuring blast contracts
const AddressManager = '0xE064B565Cf2A312a3e66Fe4118890583727380C0';
const L1CrossDomainMessenger = '0x5D4472f31Bd9385709ec61305AFc749F0fA8e9d0';
const L1StandardBridge = '0x697402166Fbf2F22E970df8a6486Ef171dbfc524'; 
const OptimismPortal = '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb';
const L2OutputOracle = '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76';

// configure the blast messenger
const blastMessager = new optimism.CrossChainMessenger({
    l1ChainId: 1,
    l2ChainId: 81457,
    l1SignerOrProvider: l1Wallet,
    l2SignerOrProvider: l2Wallet,

    contracts: {
        l1: {
          AddressManager,
          L1CrossDomainMessenger,
          L1StandardBridge,
          OptimismPortal,
          L2OutputOracle,
     
          // Need to be set to zero for this version of the SDK.
          StateCommitmentChain: ethers.constants.AddressZero,
          CanonicalTransactionChain: ethers.constants.AddressZero,
          BondManager: ethers.constants.AddressZero,
        }
      }
});

async function checkAndProveMessage(withdraw) {
    try {
        let curMessageStatus = await blastMessager.getMessageStatus(withdraw);
        console.log(`Message status for ${withdraw}: ${curMessageStatus}`);

        if (curMessageStatus === optimism.MessageStatus.READY_TO_PROVE) {
            console.log(`Proving message ${withdraw}`);
            const res = await blastMessager.proveMessage(withdraw);
            console.log(`Proving result: ${res}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// const withdraw = '0x773bda9401196d2d14d455d06c86c3d2a8fd12421ee0d415a5d10c31d6b676c5'; // tues apr 30 proof submitted 
// https://etherscan.io/tx/0xc8e1062701622d1b215760dd704fb48876b239757b0efabe845617d9846f4f6c


// const withdraw = '0x33ed8bb2ab280134d5f71956711ff99238b3be7b8b37f5ed61f691b91f0353e0'; // tues apr 30 proof submitted
// https://etherscan.io/tx/0xf082be662087a61cce8c97d6b95d2ee9c3bcee634359ed918f723f897d2b4de1

// const withdraw2 = '0xe2132c4dd62ebdb22fe76e474ba7c2c47f70d15b8d467fdd5dbd7ab7ac8fb242'; tues apr 30 proof sumbitted
// https://etherscan.io/tx/0x2d48c104fb3b9742f23c17699ff6115eaa507ac15e80b05912f06bd2966ed7db

// const withdraw3 = '0x70ee4a8e1afb7c8cb469011c59a9bf2722334a0f62cd67218c599b4ea1b90e3a'; tues apr 30 proof submitted
// https://etherscan.io/tx/0x2d48c104fb3b9742f23c17699ff6115eaa507ac15e80b05912f06bd2966ed7db


checkAndProveMessage(withdraw3);
