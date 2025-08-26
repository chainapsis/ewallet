import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export function setUpEventHandlers(this: CosmosEWalletInterface): void {
  console.log("[keplr] set up event handlers");

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
      const { changed, next, nextHex } = computePublicKeyChange(
        this.publicKey,
        payload.publicKey,
      );

      if (changed) {
        this.publicKey = next;
        console.log(
          "[keplr] _accountsChanged callback, public key changed from: %s to: %s",
          this.publicKey ? Buffer.from(this.publicKey).toString("hex") : "null",
          nextHex,
        );
        if (this.eventEmitter) {
          this.eventEmitter.emit({
            type: "accountsChanged",
            email: payload.email ?? "",
            publicKey: nextHex,
          });
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
