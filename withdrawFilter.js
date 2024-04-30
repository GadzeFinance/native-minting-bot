require('dotenv').config();

const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/blast");

provider.getBlockNumber().then((blockNumber) => {
    console.log(`Current block number: ${blockNumber}`);
}).catch((error) => {
    console.error("Error fetching current block number:", error);
});

const blastL2MessengerABI = require('./L1CrossDomainMessagerABI.json');
const blastL2MessengerAddress = '0x4200000000000000000000000000000000000007'; 

// Create a contract instance
const contract = new ethers.Contract(blastL2MessengerAddress, blastL2MessengerABI, provider);

const filter = contract.filters.SentMessageExtension1();

provider.getLogs(filter).then((logs) => {
    console.log(`Found ${logs.length} logs`);
    logs.forEach((log) => {
        const event = contract.interface.parseLog(log);
        console.log(`Transaction Hash: ${log.transactionHash}`);
        console.log(`Sender: ${event.args.sender}`);
        console.log(`Value: ${event.args.value.toString()}`);
    });
}).catch((error) => {
    console.error(error);
});
