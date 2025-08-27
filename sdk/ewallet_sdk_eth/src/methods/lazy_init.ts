import { computePublicKeyChange } from "@keplr-ewallet/ewallet-sdk-common";
import type { Result } from "@keplr-ewallet/stdlib-js";
import type { Hex } from "viem";

import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import type {
  EthEWalletInterface,
  EthEWalletState,
} from "@keplr-ewallet-sdk-eth/types";

export type LazyInitError = {
  type: "eWallet failed to initialize";
};

export async function lazyInit(
  this: EthEWalletInterface,
): Promise<Result<EthEWalletState, LazyInitError>> {
  console.log("[keplr-eth] lazy init for eth ewallet");

  const eWalletStateRes = await this.eWallet.waitUntilInitialized;

  if (!eWalletStateRes.success) {
    return { success: false, err: { type: "eWallet failed to initialize" } };
  }

  const eWalletState = eWalletStateRes.data;

  if (eWalletState.publicKey) {
    // ensure not missing initial state change
    handleAccountsChanged.call(this, eWalletState.publicKey);
  }

  this.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => handleAccountsChanged.call(this, payload.publicKey),
  });

  console.log(
    "[keplr-eth] lazy init for eth ewallet complete\npublicKey: %s\naddress: %s",
    this.state.publicKey,
    this.state.address,
  );

  return {
    success: true,
    data: {
      address: this.state.address,
      publicKey: this.state.publicKey,
    },
  };
}

function handleAccountsChanged(
  this: EthEWalletInterface,
  publicKey: string | null,
) {
  console.log("[keplr-eth] detect account change");

  const { changed, normalizedNext } = computePublicKeyChange(
    this.state.publicKey,
    publicKey,
  );

  if (changed) {
    console.log(
      "[keplr-eth] account change detected\npublic key changed from: %s to: %s",
      this.state.publicKey ? this.state.publicKey : "null",
      normalizedNext ? `0x${normalizedNext}` : "null",
    );

    const provider = this.getEthereumProvider();

    if (normalizedNext === null) {
      this.state = {
        publicKey: null,
        address: null,
      };

      provider.emit("accountsChanged", []);
      return;
    }

    const nextPublicKeyHex: Hex = `0x${normalizedNext}`;
    const nextAddress = publicKeyToEthereumAddress(nextPublicKeyHex);

    this.state = {
      publicKey: nextPublicKeyHex,
      address: nextAddress,
    };

    provider.emit("accountsChanged", [nextAddress]);
  }
}
