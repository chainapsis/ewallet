import type { KeplrEWalletInterface } from "@oko-wallet-sdk-core/types";

export function closeModal(this: KeplrEWalletInterface) {
  this.iframe.style.display = "none";
}
