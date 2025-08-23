import { type Hex } from "viem";

import { type EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";

export function setUpEventHandlers(this: EthEWallet): void {
  console.log("[eth] set up event handlers");

  this.eWallet.on("_init", (payload) => {
    console.log("[eth] _init callback, payload: %s", JSON.stringify(payload));

    if (!payload.success) {
      console.log("[eth] _init callback, error: %s", payload.err);
      this.publicKey = null;
      return;
    }

    const { changed, next } = computePublicKeyChange(
      this.publicKey,
      payload.data.publicKey,
    );
    if (changed) {
      console.log(
        "[eth] _init callback, public key changed from: %s to: %s",
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
  });

  this.eWallet.on("_accountsChanged", (payload) => {
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
  });
}

function computePublicKeyChange(
  current: Hex | null,
  next: string | null,
): { changed: boolean; next: Hex | null } {
  let nextHex: Hex | null = null;
  if (next) {
    nextHex = (next.startsWith("0x") ? next : `0x${next}`) as Hex;
  }

  const changed =
    (current === null && nextHex !== null) ||
    (current !== null && nextHex === null) ||
    (current !== null &&
      nextHex !== null &&
      current.toLowerCase() !== nextHex.toLowerCase());

  return { changed, next: nextHex };
}
