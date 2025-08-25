import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type { KeplrEWalletInterface } from "@keplr-ewallet-sdk-core/types";
import { EWALLET_ATTACHED_TARGET } from "@keplr-ewallet-sdk-core/window_msg/target";

export async function getPublicKey(
  this: KeplrEWalletInterface,
): Promise<string | null> {
  await this.waitUntilInitialized;

  const res = await this.sendMsgToIframe({
    target: EWALLET_ATTACHED_TARGET,
    msg_type: "get_public_key",
    payload: null,
  });

  if (res.msg_type === "get_public_key_ack" && res.payload.success) {
    return res.payload.data;
  }

  return null;
}
