import type {
  EWalletMsgGetCosmosChainInfo,
  KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";
import type { ChainInfo } from "@keplr-wallet/types";

type SendGetCosmosChainInfoError =
  | { type: "wrong ack message type" }
  | { type: "payload contains err"; err: any };

export async function sendGetCosmosChainInfo(
  ewallet: KeplrEWalletInterface,
  chainId?: string,
): Promise<Result<ChainInfo[], SendGetCosmosChainInfoError>> {
  const msg: EWalletMsgGetCosmosChainInfo = {
    target: "keplr_ewallet_attached",
    msg_type: "get_cosmos_chain_info",
    payload: {
      chain_id: chainId ?? null,
    },
  };

  const res = await ewallet.sendMsgToIframe(msg);

  if (res.msg_type !== "get_cosmos_chain_info_ack") {
    return { success: false, err: { type: "wrong ack message type" } };
  }

  if (!res.payload.success) {
    return {
      success: false,
      err: { type: "payload contains err", err: res.payload.err },
    };
  }

  return { success: true, data: res.payload.data };
}
