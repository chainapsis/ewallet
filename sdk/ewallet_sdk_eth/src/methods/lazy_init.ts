import { computePublicKeyChange } from "@keplr-ewallet/ewallet-sdk-common";

import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import type {
  EthEWalletInterface,
  EthEWalletState,
} from "@keplr-ewallet-sdk-eth/types";
import type { Result } from "@keplr-ewallet/stdlib-js";

export type LazyInitError = {
  type: "eWallet failed to initailize";
};

export async function lazyInit(
  this: EthEWalletInterface,
): Promise<Result<EthEWalletState, LazyInitError>> {
  console.log("[keplr-eth] set up event handlers");

  const eWalletStateRes = await this.eWallet.waitUntilInitialized;

  if (!eWalletStateRes.success) {
    return { success: false, err: { type: "eWallet failed to initailize" } };
  }

  // const eWalletState = eWalletStateRes.data;
  // if (eWalletState.publicKey) {
  //   const { changed, next } = computePublicKeyChange(
  //     this.state.publicKey,
  //     eWalletState.publicKey,
  //   );
  // }

  this.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => {
      const { changed, next } = computePublicKeyChange(
        this.state.publicKey,
        payload.publicKey,
      );

      if (changed) {
        console.log(
          "[keplr-eth] _accountsChanged callback, public key changed from: %s to: %s",
          this.state.publicKey ? this.state.publicKey : "null",
          next ? next : "null",
        );

        if (next === null) {
          this.state.publicKey = null;
          this.state.address = null;
          if (this.provider) {
            this.provider.emit("accountsChanged", []);
          }
          return;
        }

        const nextAddress = publicKeyToEthereumAddress(next);

        this.state.publicKey = next;
        this.state.address = nextAddress;
        if (this.provider) {
          this.provider.emit("accountsChanged", [nextAddress]);
        }
      }
    },
  });

  return {
    success: true,
    data: {
      address: null,
      publicKey: null,
    },
  };
}
