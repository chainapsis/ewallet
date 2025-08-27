import type {
  CosmosEWalletInterface,
  CosmosEWalletState,
} from "@keplr-ewallet-sdk-cosmos/types";
import type { Result } from "@keplr-ewallet/stdlib-js";

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

  const eWalletState = eWalletStateRes.data;
  if (eWalletState.publicKey) {
    const pk = Buffer.from(eWalletState.publicKey, "hex");
    this.state.publicKey = pk;

    this.eventEmitter.emit({
      type: "accountsChanged",
      email: eWalletState.email,
      publicKey: pk,
    });
  } else {
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

  // this.eWallet.on("_init", (payload) => {
  //   console.log(
  //     "[cosmos] _init callback, payload: %s",
  //     JSON.stringify(payload),
  //   );
  //
  //   if (!payload.success) {
  //     console.log("[cosmos] _init callback, error: %s", payload.err);
  //     this.publicKey = null;
  //     return;
  //   }
  //
  //   const { changed, next, nextHex } = computePublicKeyChange(
  //     this.publicKey,
  //     payload.data.publicKey,
  //   );
  //
  //   if (changed) {
  //     console.log(
  //       "[cosmos] _init callback, public key changed from: %s to: %s",
  //       this.publicKey ? Buffer.from(this.publicKey).toString("hex") : "null",
  //       nextHex,
  //     );
  //
  //     this.publicKey = next;
  //     if (this.eventEmitter) {
  //       this.eventEmitter.emit("accountsChanged", {
  //         email: payload.data.email ?? "",
  //         publicKey: nextHex,
  //       });
  //     }
  //   }
  // });

  this.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => {
      console.log(
        "[keplr-cosmos] CORE__accountsChanged callback, payload: %s",
        payload,
      );

      if (this.state === null) {
        throw new Error("CORE__accountsChanged unreachable");
      }

      const { changed, next, nextHex } = computePublicKeyChange(
        this.state.publicKey,
        payload.publicKey,
      );

      if (changed) {
        this.state.publicKey = next;
        console.log(
          "[keplr-cosmos] _accountsChanged callback, public key changed from: %s to: %s",
          this.state.publicKey
            ? Buffer.from(this.state.publicKey).toString("hex")
            : "null",
          nextHex,
        );

        if (next === null) {
          this.state.publicKey = null;
          this.eventEmitter.emit({
            type: "accountsChanged",
            email: null,
            publicKey: null,
          });
          return;
        }

        this.eventEmitter.emit({
          type: "accountsChanged",
          email: payload.email,
          publicKey: Buffer.from(next),
        });
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

function computePublicKeyChange(
  current: Uint8Array | null,
  nextHex: string | null,
): { changed: boolean; next: Uint8Array | null; nextHex: string } {
  const normalizedHex = nextHex ?? "";
  const next = normalizedHex ? Buffer.from(normalizedHex, "hex") : null;

  const changed =
    (current === null && next !== null) ||
    (current !== null && next === null) ||
    (current !== null && next !== null && !areUint8ArraysEqual(current, next));

  return { changed, next, nextHex: normalizedHex };
}

function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a === b) {
    return true;
  }

  if (a.byteLength !== b.byteLength) {
    return false;
  }

  for (let i = 0; i < a.byteLength; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
