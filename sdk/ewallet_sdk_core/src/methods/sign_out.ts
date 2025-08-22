import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { EWALLET_ATTACHED_TARGET } from "@keplr-ewallet-sdk-core/window_msg/target";

export async function signOut(this: KeplrEWallet) {
  await this.sendMsgToIframe({
    target: EWALLET_ATTACHED_TARGET,
    msg_type: "sign_out",
    payload: null,
  });

  this.eventEmitter.emit("_accountsChanged", {
    email: "",
    publicKey: "",
  });
}
