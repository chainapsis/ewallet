import { toHex } from "viem";

import {
  EWalletEIP1193Provider,
  type EWalletRpcChain,
} from "@keplr-ewallet-sdk-eth/provider";
import {
  DEFAULT_CHAIN_ID,
  sendGetEthChainInfo,
  parseChainId,
  convertChainInfoToRpcChain,
} from "@keplr-ewallet-sdk-eth/chains";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getEthereumProvider(
  this: EthEWalletInterface,
): Promise<EWalletEIP1193Provider> {
  if (this.provider !== null) {
    return this.provider;
  }

  await this.waitUntilInitialized;

  const chainInfoRes = await sendGetEthChainInfo(this.eWallet);
  if (!chainInfoRes.success) {
    throw new Error(
      `Failed to get chain registry response: ${chainInfoRes.err.toString()}`,
    );
  }

  let rpcChains: EWalletRpcChain[] = chainInfoRes.data
    .map((chain) => convertChainInfoToRpcChain(chain))
    .filter((chain) => chain !== null);

  if (rpcChains.length === 0) {
    throw new Error("No chains found");
  }

  const activeChain = rpcChains.find(
    (chain) => parseChainId(chain.chainId) === DEFAULT_CHAIN_ID,
  );

  if (activeChain !== undefined) {
    rpcChains = [
      activeChain,
      ...rpcChains.filter(
        (chain) => parseChainId(chain.chainId) !== DEFAULT_CHAIN_ID,
      ),
    ];
  }

  this.provider = new EWalletEIP1193Provider({
    signer: {
      sign: (params) => this.makeSignature(params),
      getAddress: () => this.state.address,
    },
    chains: rpcChains,
  });

  return this.provider;
}
