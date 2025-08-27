import type { Result } from "@keplr-ewallet/stdlib-js";

import type {
  CosmosEWalletInterface,
  CosmosEWalletState,
} from "@keplr-ewallet-sdk-cosmos/types";

export type LazyInitError = {
  type: "eWallet failed to initailize";
};

export async function lazyInit(
  this: CosmosEWalletInterface,
): Promise<Result<CosmosEWalletState, LazyInitError>> {
  const eWalletStateRes = await this.eWallet.waitUntilInitialized;

  if (!eWalletStateRes.success) {
    return { success: false, err: { type: "eWallet failed to initailize" } };
  }

  console.log("[keplr-cosmos] lazy init for cosmos ewallet complete", {
    email: eWalletStateRes.data.email,
    publicKey: eWalletStateRes.data.publicKey,
  });

  const eWalletState = eWalletStateRes.data;
  if (eWalletState.publicKey) {
    const pk = Buffer.from(eWalletState.publicKey, "hex");

    this.state = {
      publicKey: pk,
      publicKeyRaw: eWalletState.publicKey,
    };

    this.eventEmitter.emit({
      type: "accountsChanged",
      email: eWalletState.email,
      publicKey: pk,
    });
  } else {
    this.state = {
      publicKey: null,
      publicKeyRaw: null,
    };

    this.eventEmitter.emit({
      type: "accountsChanged",
      email: eWalletState.email,
      publicKey: null,
    });
  }

  this.setUpEventHandlers();

  return { success: true, data: this.state };
}

export function setUpEventHandlers(this: CosmosEWalletInterface): void {
  console.log("[keplr-cosmos] set up event handlers");

  this.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => {
      console.log(
        "[keplr-cosmos] CORE__accountsChanged callback, payload: %s",
        payload,
      );

      const { publicKey } = payload;

      if (this.state.publicKeyRaw !== publicKey) {
        if (publicKey !== null) {
          const pk = Buffer.from(publicKey, "hex");

          this.state = {
            publicKey: pk,
            publicKeyRaw: publicKey,
          };
        } else {
          this.state = {
            publicKey: null,
            publicKeyRaw: null,
          };
        }
      }
    },
  });

  this.eWallet.on({
    type: "CORE__chainChanged",
    handler: (_payload) => {
      this.eventEmitter.emit({ type: "chainChanged" });
    },
  });
}
