import { toHex, type Chain } from "viem";
import { v4 as uuidv4 } from "uuid";

import {
  initEWalletEIP1193Provider,
  type EWalletEIP1193Provider,
} from "@keplr-ewallet-sdk-eth/provider";
import type { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import {
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
  TESTNET_CHAINS,
} from "@keplr-ewallet-sdk-eth/chains";

export async function getEthereumProvider(
  this: EthEWallet,
): Promise<EWalletEIP1193Provider> {
  if (this.provider !== null) {
    return this.provider;
  }

  let chains: Chain[] = SUPPORTED_CHAINS;

  if (this.useTestnet) {
    chains = [...chains, ...TESTNET_CHAINS];
  }

  const activeChain =
    chains.find((chain) => chain.id === DEFAULT_CHAIN_ID) ?? chains[0];

  const addEthereumChains = [
    activeChain,
    ...chains.filter((chain) => chain.id !== DEFAULT_CHAIN_ID),
  ].map((chain) => ({
    chainId: toHex(chain.id),
    chainName: chain.name,
    rpcUrls: chain.rpcUrls.default.http,
    nativeCurrency: chain.nativeCurrency,
    blockExplorerUrls: chain.blockExplorers?.default.url
      ? [chain.blockExplorers.default.url]
      : [],
  }));

  // ensure init address here to avoid missing address when page reload or reconnecting
  // address change should be handled by event listener not by signer interface
  await this.getAddress();

  this.provider = await initEWalletEIP1193Provider({
    id: uuidv4(),
    signer: {
      sign: this.makeSignature,
      getAddress: () => this.address, // address change should be handled by event listener
    },
    chains: addEthereumChains,
    skipChainValidation: true,
  });

  return this.provider;
}
