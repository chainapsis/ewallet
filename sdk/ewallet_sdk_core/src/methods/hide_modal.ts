import type { KeplrEWalletInterface } from "@keplr-ewallet-sdk-core/types";

export async function hideModal(this: KeplrEWalletInterface) {
  this.iframe.style.display = "none";
}
