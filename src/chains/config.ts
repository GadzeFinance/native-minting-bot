import { providers, Wallet } from 'ethers';
require('dotenv').config();

export const PRIVATE_KEY: string = process.env.PRIVATE_KEY!;

export interface ChainInfo {
  name: string;
  provider: providers.JsonRpcProvider;
  wallet: Wallet;
  syncPoolAddress: string;
  ethAddress: string;
}

export const chains: ChainInfo[] = [
  {
    name: 'blast',
    provider: new providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
  },
  {
    name: 'base',
    provider: new providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-'),
    wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-')),
    syncPoolAddress: "0xc38e046dFDAdf15f7F56853674242888301208a5",
    ethAddress: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"  // TODO: Add the correct address
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
export const mainnetProvider = new providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52');
export const mainnetWallet = new Wallet(PRIVATE_KEY, mainnetProvider);

// Discord webhook
export const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1237225752512958525/7w8cw_tO1iGK4csPgVq1K8Ajjt0wSG5NT5TnnDtGW_CQ61Zi6_nEtCYvM9Rt-95cJzKp"