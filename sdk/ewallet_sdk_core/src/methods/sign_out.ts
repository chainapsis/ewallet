import type { KeplrEWalletInterface } from "@keplr-ewallet-sdk-core/types";
import { EWALLET_ATTACHED_TARGET } from "@keplr-ewallet-sdk-core/window_msg/target";

export async function signOut(this: KeplrEWalletInterface) {
  await this.waitUntilInitialized;

  await this.sendMsgToIframe({
    target: EWALLET_ATTACHED_TARGET,
    msg_type: "sign_out",
    payload: null,
  });

  this.eventEmitter.emit({
    type: "CORE__accountsChanged",
    email: null,
    publicKey: null,
  });
}
