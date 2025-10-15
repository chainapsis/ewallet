import type {
  EWalletMsgGetEthChainInfo,
  KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";
import type { ChainInfo } from "@keplr-wallet/types";
import { toHex } from "viem";

import type { EWalletRpcChain } from "@keplr-ewallet-sdk-eth/provider";
import type { SendGetEthChainInfoError } from "@keplr-ewallet-sdk-eth/errors";

export const DEFAULT_CHAIN_ID = 1;

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

export function convertChainInfoToRpcChain(
  chainInfo: ChainInfo,
): EWalletRpcChain | null {
  if (chainInfo.currencies.length === 0) {
    return null;
  }

  return {
    chainId: toHex(parseChainId(chainInfo.chainId)),
    chainName: chainInfo.chainName,
    rpcUrls: [chainInfo.rpc],
    nativeCurrency: {
      name: chainInfo.currencies[0].coinMinimalDenom,
      symbol: chainInfo.currencies[0].coinDenom,
      decimals: chainInfo.currencies[0].coinDecimals,
    },
    chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
    currencies: chainInfo.currencies,
    bip44: chainInfo.bip44,
    features: chainInfo.features,
    evm: chainInfo.evm,
  };
}

export async function sendGetEthChainInfo(
  ewallet: KeplrEWalletInterface,
  chainId?: string,
): Promise<Result<ChainInfo[], SendGetEthChainInfoError>> {
  const msg: EWalletMsgGetEthChainInfo = {
    target: "keplr_ewallet_attached",
    msg_type: "get_eth_chain_info",
    payload: {
      chain_id: chainId ?? null,
    },
  };

  const res = await ewallet.sendMsgToIframe(msg);

  if (res.msg_type !== "get_eth_chain_info_ack") {
    return { success: false, err: { type: "wrong_ack_message_type" } };
  }

  if (!res.payload.success) {
    return {
      success: false,
      err: { type: "payload_contains_err", err: res.payload.err },
    };
  }

  return { success: true, data: res.payload.data };
}
