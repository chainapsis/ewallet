import { toHex, type Chain } from "viem";

import { EWalletEIP1193Provider } from "@keplr-ewallet-sdk-eth/provider";
import {
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
} from "@keplr-ewallet-sdk-eth/chains";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getEthereumProvider(
  this: EthEWalletInterface,
): Promise<EWalletEIP1193Provider> {
  if (this.provider !== null) {
    return this.provider;
  }

  await this.waitUntilInitialized;

  // TODO: get chain info from attached
  let chains: Chain[] = SUPPORTED_CHAINS;

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

  this.provider = new EWalletEIP1193Provider({
    signer: {
      sign: (params) => this.makeSignature(params),
      getAddress: () => this.state.address,
    },
    chains: addEthereumChains,
  });

  return this.provider;
}
