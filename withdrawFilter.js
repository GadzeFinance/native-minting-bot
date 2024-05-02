require('dotenv').config();

const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider("https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52");

const blastL2MessengerABI = require('./L1CrossDomainMessagerABI.json');
const blastL2MessengerAddress = '0x4200000000000000000000000000000000000007'; 

// Create a contract instance
const contract = new ethers.Contract(blastL2MessengerAddress, blastL2MessengerABI, provider);

const startBlockInitial = 2612000;
const blockInterval = 50000;

provider.getBlockNumber().then(async (latestBlockNumber) => {
    for (let startBlock = startBlockInitial; startBlock <= latestBlockNumber; startBlock += blockInterval) {
        let endBlock = startBlock + blockInterval - 1;
        
        // Adjust the end block to not exceed the latest block number
        if (endBlock > latestBlockNumber) {
            endBlock = latestBlockNumber;
        }

        console.log(contract.filters.SentMessageExtension1().topics);

        const filter = {
            address: blastL2MessengerAddress,
            topics: [
                contract.filters.SentMessageExtension1().topics[0],
                
            ],
            fromBlock: startBlock,
            toBlock: endBlock
        };

        try {
            const logs = await provider.getLogs(filter);
            console.log(`Found ${logs.length} logs in block range ${startBlock} - ${endBlock}`);
            logs.forEach((log) => {
                const event = contract.interface.parseLog(log);

                console.log(`Transaction Hash: ${log.transactionHash}`);
                console.log(`Sender: ${event.args.sender}`);
                console.log(`Value: ${event.args.value.toString()}`);

            });
        } catch (error) {
            console.error(error);
        }
    }
}).catch((error) => {
    console.error(error);
});
