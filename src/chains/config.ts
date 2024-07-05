import { providers, Wallet } from 'ethers';
require('dotenv').config();

export const PRIVATE_KEY: string = process.env.PRIVATE_KEY!;

export interface ChainInfo {
  name: string;
  provider: providers.JsonRpcProvider;
  wallet: Wallet;
  syncPoolAddress: string;
  dummyEthAddress: string;
}
 
export const CHAINS: ChainInfo[] = [
  {
    name: 'blast',
    provider: new providers.JsonRpcProvider('https://blast-mainnet.g.alchemy.com/v2/JLScbmf_PtNhzCkrEF6geTxuQGu0ReEI'),
    wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B", 
    dummyEthAddress: "0x83998e169026136760bE6AF93e776C2F352D4b28"
  },
  {
    name: 'base',
    provider: new providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/JLScbmf_PtNhzCkrEF6geTxuQGu0ReEI'),
    wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-')),
    syncPoolAddress: "0xc38e046dFDAdf15f7F56853674242888301208a5",
    dummyEthAddress: "0x0295E0CE709723FB25A28b8f67C54a488BA5aE46"
  },
  {
    name: 'mode',
    provider: new providers.JsonRpcProvider('https://mainnet.mode.network'),
    wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://mainnet.mode.network')),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    dummyEthAddress: "0xDc400f3da3ea5Df0B7B6C127aE2e54CE55644CF3"
  },
  {
    name: 'linea',
    provider: new providers.JsonRpcProvider('https://linea-mainnet.g.alchemy.com/v2/NDkFTWJOHkUOfPD60wWD11yzwrNPsnr_'),
    wallet: new Wallet(PRIVATE_KEY, new providers.JsonRpcProvider('https://linea-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52')),
    syncPoolAddress: "0x823106E745A62D0C2FC4d27644c62aDE946D9CCa",
    dummyEthAddress: "0x61Ff310aC15a517A846DA08ac9f9abf2A0f9A2bf"
  },
];

// Mainnet configs
export const MAINNET_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/NDkFTWJOHkUOfPD60wWD11yzwrNPsnr_';
export const MAINNET_PROVIDER = new providers.JsonRpcProvider(MAINNET_RPC_URL);
export const MAINNET_WALLET = new Wallet(PRIVATE_KEY, MAINNET_PROVIDER);
export const ETHERSCAN_PROVIDER = new providers.EtherscanProvider('homestead', 'JGN3S8FGA23GJ8MVYUGVUJ5Z2RYH4QYUJ7');

// Discord webhook
export const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1237225752512958525/7w8cw_tO1iGK4csPgVq1K8Ajjt0wSG5NT5TnnDtGW_CQ61Zi6_nEtCYvM9Rt-95cJzKp"
export const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

// OP stack precompile contracts
export const L2_CROSS_DOMAIN_MESSENGER = "0x4200000000000000000000000000000000000007"
