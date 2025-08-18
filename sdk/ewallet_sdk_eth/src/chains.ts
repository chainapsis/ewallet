import type { Address } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  blast,
  citreaTestnet,
  forma,
  mainnet,
  optimism,
  polygon,
  sepolia,
  unichain,
} from "viem/chains";

export const DEFAULT_CHAIN_ID = 1;

export const SUPPORTED_CHAINS = [
  mainnet,
  base,
  optimism,
  arbitrum,
  blast,
  avalanche,
  unichain,
  polygon,
  forma,
  berachain,
  sepolia,
  citreaTestnet,
];

export const SUPPORTED_OP_STACK_CHAINS = [base, optimism, unichain, blast];

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

  let path = "";
  if (tokenAddress) {
    path = `erc20/${tokenAddress.toLowerCase()}.png`;
  } else {
    path = `${chainIdNumber}-native.png`;
    if (chainIdNumber === 11155111) {
      path = `ethereum-${path}`;
    }
  }

  return `${baseUrl}/${path}`;
}
