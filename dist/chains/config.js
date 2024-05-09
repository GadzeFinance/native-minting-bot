"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH_ADDRESS = exports.DISCORD_WEBHOOK_URL = exports.MAINNET_WALLET = exports.MAINNET_PROVIDER = exports.MAINNET_RPC_URL = exports.CHAINS = exports.PRIVATE_KEY = void 0;
const ethers_1 = require("ethers");
require('dotenv').config();
exports.PRIVATE_KEY = process.env.PRIVATE_KEY;
exports.CHAINS = [
    {
        name: 'blast',
        provider: new ethers_1.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
        wallet: new ethers_1.Wallet(exports.PRIVATE_KEY, new ethers_1.providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
        syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    },
    {
        name: 'base',
        provider: new ethers_1.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-'),
        wallet: new ethers_1.Wallet(exports.PRIVATE_KEY, new ethers_1.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-')),
        syncPoolAddress: "0xc38e046dFDAdf15f7F56853674242888301208a5",
    },
    // {
    //   name: 'mode',
    //   provider: new providers.JsonRpcProvider('https://mode-mainnet.blastapi.io/816787c6-56dc-4717-8354-5f5f4128590b'),
    //   wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://mode-mainnet.blastapi.io/816787c6-56dc-4717-8354-5f5f4128590b')),
    //   syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    // },
    // {
    //   name: 'linea',
    //   provider: new providers.JsonRpcProvider('https://linea-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    //   wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://linea-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
    //   syncPoolAddress: "0x823106E745A62D0C2FC4d27644c62aDE946D9CCa",
    // },
    // Add more chains here
];
// Mainnet configs
exports.MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52';
exports.MAINNET_PROVIDER = new ethers_1.providers.JsonRpcProvider(exports.MAINNET_RPC_URL);
exports.MAINNET_WALLET = new ethers_1.Wallet(exports.PRIVATE_KEY, exports.MAINNET_PROVIDER);
// Discord webhook
exports.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1237225752512958525/7w8cw_tO1iGK4csPgVq1K8Ajjt0wSG5NT5TnnDtGW_CQ61Zi6_nEtCYvM9Rt-95cJzKp";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
