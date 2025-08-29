import type { Result } from "@keplr-ewallet/stdlib-js";

import type {
  CosmosEWalletInterface,
  CosmosEWalletState,
} from "@keplr-ewallet-sdk-cosmos/types";
import type { LazyInitError } from "@keplr-ewallet-sdk-cosmos/errors";

export async function lazyInit(
  cosmosEWallet: CosmosEWalletInterface,
): Promise<Result<CosmosEWalletState, LazyInitError>> {
  const eWalletStateRes = await cosmosEWallet.eWallet.waitUntilInitialized;

  if (!eWalletStateRes.success) {
    return { success: false, err: { type: "eWallet failed to initailize" } };
  }

  const eWalletState = eWalletStateRes.data;
  if (eWalletState.publicKey) {
    const pk = Buffer.from(eWalletState.publicKey, "hex");

    cosmosEWallet.state = {
      publicKey: pk,
      publicKeyRaw: eWalletState.publicKey,
    };

    cosmosEWallet.eventEmitter.emit({
      type: "accountsChanged",
      email: eWalletState.email,
      publicKey: pk,
    });
  } else {
    cosmosEWallet.state = {
      publicKey: null,
      publicKeyRaw: null,
    };

    cosmosEWallet.eventEmitter.emit({
      type: "accountsChanged",
      email: eWalletState.email,
      publicKey: null,
    });
  }

  setUpEventHandlers(cosmosEWallet);

  return { success: true, data: cosmosEWallet.state };
}

export function setUpEventHandlers(
  cosmosEWallet: CosmosEWalletInterface,
): void {
  console.log("[keplr-cosmos] set up event handlers");

  cosmosEWallet.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => {
      console.log(
        "[keplr-cosmos] CORE__accountsChanged callback, payload: %s",
        JSON.stringify(payload),
      );

      const { publicKey, email } = payload;

      if (cosmosEWallet.state.publicKeyRaw !== publicKey) {
        if (publicKey !== null) {
          const pk = Buffer.from(publicKey, "hex");

          cosmosEWallet.state = {
            publicKey: pk,
            publicKeyRaw: publicKey,
          };
        } else {
          cosmosEWallet.state = {
            publicKey: null,
            publicKeyRaw: null,
          };
        }

        cosmosEWallet.eventEmitter.emit({
          type: "accountsChanged",
          email: email,
          publicKey: cosmosEWallet.state.publicKey,
        });
      }
    },
  });

  cosmosEWallet.eWallet.on({
    type: "CORE__chainChanged",
    handler: (_payload) => {
      cosmosEWallet.eventEmitter.emit({ type: "chainChanged" });
    },
  });
}
