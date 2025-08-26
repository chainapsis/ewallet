import type { ChainInfo } from "@keplr-wallet/types";
import { type Result } from "@keplr-ewallet/stdlib-js";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

const CACHE_TIME = 1000 * 60 * 60 * 1; // 1 hour in ms

export async function getCosmosChainInfo(
  this: CosmosEWalletInterface,
): Promise<ChainInfo[]> {
  const isCacheExpired = Date.now() - this.cacheTime > CACHE_TIME;

  if (isCacheExpired || this.cosmosChainInfo === null) {
    const chainInfoRes = await fetchCosmosChainInfo();
    if (!chainInfoRes) {
      throw new Error("Failed to get chain registry response");
    }

    if (!chainInfoRes.success) {
      throw new Error(chainInfoRes.err);
    }

    this.cosmosChainInfo = chainInfoRes.data.chains;
    this.cacheTime = Date.now();
  }

  return this.cosmosChainInfo;
}

export async function fetchCosmosChainInfo(): Promise<
  Result<ChainInfoResponse, string>
> {
  try {
    const response = await fetch(
      "https://keplr-chain-registry.vercel.app/api/chains",
    );
    const chains = (await response.json()) as ChainInfoResponse | null;

    if (!chains) {
      return { success: false, err: "Failed to fetch chain info" };
    }

    return { success: true, data: chains };
  } catch (error) {
    console.error("Error fetching chain info:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return { success: false, err: errorMessage };
  }
}

interface ChainInfoResponse {
  chains: ChainInfo[];
}
