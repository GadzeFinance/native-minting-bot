# L2 Native Minting Bot
Our native minting system requires a set of transactions to be executed on each chain to sync with the L1 liquidity pool. All of these calls are permissionless; hence, this bot has an EOA it uses to submit these transactions.

## L2 -> L1 Sync Overview
For all `weETH` minting on L2s, there is corresponding `weETH` minted and deposited into the [EtherFiOFTAdapter](https://etherscan.io/address/0xFE7fe01F8B9A76803aF3750144C2715D9bcf7D0D) contract. The `wETH` from L2s must also be bridged back to mainnet for deposit into the [Liquidity Pool](https://etherscan.io/address/0x308861A430be4cce5502d0A12724771Fc6DaF216).

### fast-sync
If an L2 `SyncPool` contract—[Blast Example SyncPool](https://blastscan.io/address/0x52c4221cb805479954cde5accff8c4dcaf96623b)—has more than 1000 `ETH`, the bot will initiate a `sync` call on said contract. Subsequantly, the `ETH` in the `SyncPool` is sent to be bridged to mainnet via canonical bridge, and a LayerZero message is sent to be executed on mainnet by the [Layer Zero: Executor](https://etherscan.io/address/0xe93685f3bba03016f02bd1828badd6195988d950).
The LayerZero message causes the following actions on Mainnet:
- `Dummy ETH` is deposited into EtherFi through the [Vampire Contract](https://etherscan.io/address/0x9ffdf407cde9a93c47611799da23924af3ef764f).
- `weETH` is minted and deposited in the [EtherFiOFTAdapter](https://etherscan.io/address/0xFE7fe01F8B9A76803aF3750144C2715D9bcf7D0D).

### slow-sync
After `fast-sync` sends ETH to the L2 canonical bridge and the sequencer submits the transaction's state root to mainnet, the bot performs these steps to withdraw the ETH:
- Submit a proof of withdrawal transaction.
- Wait 7 to 14 days (variable for each L2) for the challenge period to pass.
- Submit a relay transaction.

For an optimisitic rollup like an OP stack chain the transaction moves through these 5 states: <br>
Waiting for state root -> Ready to prove -> In challenge period -> Ready for relay -> Relayed

## Repo Structure
```
project-root/
│
├── src/                   # Source files
│   ├── bot/               # Core bot functionality
│   │   └── index.ts       # Entry point for the bot logic
│   │
│   ├── chains/            # Chain-specific logic and configurations
│   │   ├── index.ts       # Export configured chain instances
│   │   ├── chainConfig.ts # Configurations for different chains
│   │   └── helpers/       # Helpers specific to blockchain operations
│   │       ├── logs.ts    # Helpers to handle blockchain logs
│   │       └── tx.ts      # Helpers to manage transactions
│   │
│   ├── config/            # General configuration files
│   │   ├── index.ts       # Aggregate and export configs
│   │   └── rpcs.ts        # RPC URLs and related settings
│   │
│   └── abis/          
│       ├── Contract1.json
│       ├── Contract2.json
│       └── index.ts       # Export ABIs for easy import elsewhere
│
├── dist/                  # Compiled JavaScript files
├── node_modules/          # npm packages
├── test/                  # Test files
│
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview and setup instructions
```
