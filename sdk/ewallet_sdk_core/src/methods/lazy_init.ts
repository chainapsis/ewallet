import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { registerMsgListener } from "@keplr-ewallet-sdk-core/window_msg/listener";

export async function lazyInit(this: KeplrEWallet) {
  const registered = await registerMsgListener();
  return registered;
}
