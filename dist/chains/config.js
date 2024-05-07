"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCORD_WEBHOOK_URL = exports.mainnetWallet = exports.mainnetProvider = exports.chains = exports.PRIVATE_KEY = void 0;
const ethers_1 = require("ethers");
require('dotenv').config();
exports.PRIVATE_KEY = process.env.PRIVATE_KEY;
exports.chains = [
    {
        name: 'blast',
        provider: new ethers_1.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
        wallet: new ethers_1.Wallet(exports.PRIVATE_KEY, new ethers_1.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
        syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
        ethAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    },
    {
        name: 'base',
        provider: new ethers_1.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-'),
        wallet: new ethers_1.Wallet(exports.PRIVATE_KEY, new ethers_1.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-')),
        syncPoolAddress: "0xc38e046dFDAdf15f7F56853674242888301208a5",
        ethAddress: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" // TODO: Add the correct address
    }
    // {
    //   name: 'mode',
    //   provider: new providers.JsonRpcProvider('https://mainnet.mode.network'),
    //   wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://mainnet.mode.network')),
    //   syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    //   ethAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    // },
    // {
    //   name: 'linea',
    //   provider: new providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    //   wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
    //   syncPoolAddress: "0x823106E745A62D0C2FC4d27644c62aDE946D9CCa",
    //   ethAddress: "0x0" // TODO: Add the correct address
    // },
    // Add more chains here
];
// Mainnet configs
exports.mainnetProvider = new ethers_1.providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52');
exports.mainnetWallet = new ethers_1.Wallet(exports.PRIVATE_KEY, exports.mainnetProvider);
// Discord webhook
exports.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1237225752512958525/7w8cw_tO1iGK4csPgVq1K8Ajjt0wSG5NT5TnnDtGW_CQ61Zi6_nEtCYvM9Rt-95cJzKp";
