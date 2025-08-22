import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

export async function onInit(
  this: KeplrEWallet,
  subscriber: (initSuccess: boolean) => void,
) {
  console.log("[keplr] onInit registered");
  this.initSubscribers.push(subscriber);
}
