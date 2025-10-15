import { defineChain } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  blast,
  forma,
  mainnet,
  optimism,
  polygon,
  unichain,
  story,
} from "viem/chains";

// TODO: remove chains
const bnbSmartChain = defineChain({
  id: 56,
  name: "BNB Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://evm-56.keplr.app"] },
  },
  blockExplorers: {
    default: {
      name: "BSCScan",
      url: "https://bscscan.com",
      apiUrl: "https://api.bscscan.com/api",
    },
  },
});

export const DEFAULT_CHAIN_ID = 1;

export const SUPPORTED_CHAINS = [
  {
    ...mainnet,
    rpcUrls: {
      default: {
        http: ["https://evm-1.keplr.app"],
      },
    },
  },
  {
    ...base,
    rpcUrls: {
      default: {
        http: ["https://evm-8453.keplr.app"],
      },
    },
  },
  {
    ...optimism,
    name: "Optimism",
    rpcUrls: {
      default: {
        http: ["https://evm-10.keplr.app"],
      },
    },
  },
  {
    ...arbitrum,
    name: "Arbitrum",
    rpcUrls: {
      default: {
        http: ["https://evm-42161.keplr.app"],
      },
    },
  },
  bnbSmartChain,
  {
    ...blast,
    rpcUrls: {
      default: {
        http: ["https://evm-81457.keplr.app"],
      },
    },
  },
  {
    ...avalanche,
    rpcUrls: {
      default: {
        http: ["https://evm-43114.keplr.app"],
      },
    },
  },
  {
    ...unichain,
    rpcUrls: {
      default: {
        http: ["https://evm-130.keplr.app"],
      },
    },
  },
  {
    ...polygon,
    rpcUrls: {
      default: {
        http: ["https://evm-137.keplr.app"],
      },
    },
  },
  {
    ...forma,
    rpcUrls: {
      default: {
        http: ["https://evm-984122.keplr.app"],
      },
    },
  },
  {
    ...berachain,
    rpcUrls: {
      default: {
        http: ["https://evm-80094.keplr.app"],
      },
    },
  },
  {
    ...story,
    rpcUrls: {
      default: {
        http: ["https://evm-1514.keplr.app"],
      },
    },
  },
];
