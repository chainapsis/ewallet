import type {
  EWalletMsgGetCosmosChainInfo,
  KeplrEWalletInterface,
} from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";
import type { ChainInfo } from "@keplr-wallet/types";

type SendGetCosmosChainInfoError =
  | { type: "wrong_ack_message_type" }
  | { type: "payload_contains_err"; err: any };

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
