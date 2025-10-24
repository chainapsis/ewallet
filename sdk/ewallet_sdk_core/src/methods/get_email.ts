import type { KeplrEWalletInterface } from "@oko-wallet-sdk-core/types";
import { EWALLET_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";

export async function getEmail(
  this: KeplrEWalletInterface,
): Promise<string | null> {
  await this.waitUntilInitialized;

  const res = await this.sendMsgToIframe({
    target: EWALLET_ATTACHED_TARGET,
    msg_type: "get_email",
    payload: null,
  });

  if (res.msg_type === "get_email_ack" && res.payload.success) {
    return res.payload.data;
  }

  return null;
}
