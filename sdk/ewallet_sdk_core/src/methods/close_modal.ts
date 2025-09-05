import type { KeplrEWalletInterface } from "@keplr-ewallet-sdk-core/types";

export function closeModal(this: KeplrEWalletInterface) {
  this.iframe.style.display = "none";
}
