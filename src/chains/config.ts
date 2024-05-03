import { providers, Wallet } from 'ethers';
require('dotenv').config();

export const PRIVATE_KEY: string = process.env.PRIVATE_KEY!;

export interface ChainInfo {
  name: string;
  provider: providers.JsonRpcProvider;
  syncPoolAddress: string;
  ethAddress: string;
}

export const chains: ChainInfo[] = [
  {
    name: 'blast',
    provider: new providers.JsonRpcProvider('https://blast-mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
  },
  {
    name: 'mode',
    provider: new providers.JsonRpcProvider('https://mainnet.mode.network'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  },
  {
    name: 'base',
    provider: new providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/tb6jud_eQqvR2JK8NoUlLIoBf9P-oqd-'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0x0"
  },
  {
    name: 'linea',
    provider: new providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52'),
    syncPoolAddress: "0x52c4221Cb805479954CDE5accfF8C4DcaF96623B",
    ethAddress: "0x0" 
  },
  // Add more chains here
];

// Mainnet configs
export const mainnetProvider = new providers.JsonRpcProvider('https://mainnet.infura.io/v3/3cfca4bf32d54476ae33585ba8983c52');
export const mainnetWallet = new Wallet(PRIVATE_KEY, mainnetProvider);
