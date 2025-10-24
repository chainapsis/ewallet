import { toHex, type Hex } from "viem";

import type { EthEWalletInterface } from "@oko-wallet-sdk-eth/types";

export async function switchChain(
  this: EthEWalletInterface,
  chainId: Hex | number,
): Promise<void> {
  const provider = await this.getEthereumProvider();

  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: toHex(chainId) }],
  });
}
