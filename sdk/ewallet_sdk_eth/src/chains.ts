import { defineChain, type Address } from "viem";
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
  sepolia,
  unichain,
  story,
  citreaTestnet,
} from "viem/chains";

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

export const TESTNET_CHAINS = [sepolia, citreaTestnet];

export const OP_STACK_CHAIN_IDS = [base.id, optimism.id, unichain.id, blast.id];

export function parseChainId(chainId: string | number): number {
  if (typeof chainId === "string") {
    const [chainNamespace, chainIdStr] = chainId.split(":");
    if (chainNamespace === "eip155") {
      return parseInt(chainIdStr, 10);
    } else {
      return parseInt(chainId, 10);
    }
  } else {
    return chainId;
  }
}

export function getChainIconUrl(chainId: string | number) {
  const chainIdNumber = parseChainId(chainId);
  return `https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:${chainIdNumber}/chain.png`;
}

export function getTokenLogoURI(
  chainId: string | number,
  tokenAddress?: Address,
) {
  const chainIdNumber = parseChainId(chainId);
  const baseUrl = `https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:${chainIdNumber}`;

  if (tokenAddress) {
    return `${baseUrl}/erc20/${tokenAddress.toLowerCase()}.png`;
  }

  switch (chainIdNumber) {
    case 56:
      return `${baseUrl}/binance-native.png`;
    case 984122:
      return `${baseUrl}/utia.png`;
    case 11155111:
      return `${baseUrl}/ethereum-sepolia-native.png`;
    default:
      const chain = SUPPORTED_CHAINS.find(
        (chain) => chain.id === chainIdNumber,
      );
      if (chain) {
        return `${baseUrl}/${chain.name.toLowerCase()}-native.png`;
      }

      return "";
  }
}
