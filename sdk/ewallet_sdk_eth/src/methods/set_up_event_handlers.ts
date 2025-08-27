import { computePublicKeyChange } from "@keplr-ewallet/ewallet-sdk-common";

import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export function setUpEventHandlers(this: EthEWalletInterface): void {
  console.log("[eth] set up event handlers");

  this.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => {
      const { changed, next } = computePublicKeyChange(
        this.publicKey,
        payload.publicKey,
      );

      if (changed) {
        console.log(
          "[eth] _accountsChanged callback, public key changed from: %s to: %s",
          this.publicKey ? this.publicKey : "null",
          next ? next : "null",
        );

        if (next === null) {
          this.publicKey = null;
          this.address = null;
          if (this.provider) {
            this.provider.emit("accountsChanged", []);
          }
          return;
        }

        const nextAddress = publicKeyToEthereumAddress(next);

        this.publicKey = next;
        this.address = nextAddress;
        if (this.provider) {
          this.provider.emit("accountsChanged", [nextAddress]);
        }
      }
    },
  });
}
