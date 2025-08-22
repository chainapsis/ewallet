import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type { LazyInitSubscriberFn } from "@keplr-ewallet-sdk-core/types";

export async function onInit(
  this: KeplrEWallet,
  subscriber: LazyInitSubscriberFn,
) {
  console.log("[keplr] init subscriber registered");

  this.initSubscribers.push(subscriber);
}
