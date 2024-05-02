### L2 Native Minting Bot
Our native minting system requires a set of transactions to be executed on each chain to sync with the L1 liquidity pool


```
project-root/
│
├── src/                   # Source files
│   ├── bot/               # Core bot functionality
│   │   ├── index.ts       # Entry point for the bot logic
│   │   └── scheduler.ts   # Scheduling logic to trigger the bot
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
│   └── abis/              # ABI files for smart contracts
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
