"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainnetWallet = exports.mainnetProvider = exports.chains = exports.PRIVATE_KEY = void 0;
const ethers_1 = require("ethers");
require('dotenv').config();
exports.PRIVATE_KEY = process.env.PRIVATE_KEY;
exports.chains = [
    {
        name: 'blast',
        provider: new ethers_1.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
        syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
        ethAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    },
    // {
    //   name: 'mode',
    //   provider: new providers.JsonRpcProvider('https://mainnet.mode.network'),
    //   syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    //   ethAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    // },
    // {
    //   name: 'base',
    //   provider: new providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-'),
    //   syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    //   ethAddress: "0x0"
    // },
    // {
    //   name: 'linea',
    //   provider: new providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    //   syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    //   ethAddress: "0x0" 
    // },
    // Add more chains here
];
// Mainnet configs
exports.mainnetProvider = new ethers_1.providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52');
exports.mainnetWallet = new ethers_1.Wallet(exports.PRIVATE_KEY, exports.mainnetProvider);
