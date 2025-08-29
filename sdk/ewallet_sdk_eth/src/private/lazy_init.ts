import type { Result } from "@keplr-ewallet/stdlib-js";
import type { Hex } from "viem";

import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import type {
  EthEWalletInterface,
  EthEWalletState,
} from "@keplr-ewallet-sdk-eth/types";
import type { LazyInitError } from "@keplr-ewallet-sdk-eth/errors";

export async function lazyInit(
  ethEwallet: EthEWalletInterface,
): Promise<Result<EthEWalletState, LazyInitError>> {
  console.log("[keplr-eth] lazy init for eth ewallet");

  const eWalletStateRes = await ethEwallet.eWallet.waitUntilInitialized;

  if (!eWalletStateRes.success) {
    return { success: false, err: { type: "eWallet failed to initialize" } };
  }

  const eWalletState = eWalletStateRes.data;

  if (eWalletState.publicKey) {
    // ensure not missing initial state change
    handleAccountsChanged.call(ethEwallet, eWalletState.publicKey);
  }

  setUpEventHandlers.call(ethEwallet);

  console.log(
    "[keplr-eth] lazy init for eth ewallet complete\npublicKeyRaw: %s\npublicKey: %s\naddress: %s",
    ethEwallet.state.publicKeyRaw,
    ethEwallet.state.publicKey,
    ethEwallet.state.address,
  );

  return {
    success: true,
    data: ethEwallet.state,
  };
}

function setUpEventHandlers(this: EthEWalletInterface) {
  this.eWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => handleAccountsChanged.call(this, payload.publicKey),
  });
}

function handleAccountsChanged(
  this: EthEWalletInterface,
  publicKey: string | null,
) {
  console.log("[keplr-eth] detect account change", publicKey);

  const currentPublicKeyRaw = normalizeKey(this.state.publicKeyRaw);
  const publicKeyNormalized = normalizeKey(publicKey);

  const changed = currentPublicKeyRaw !== publicKeyNormalized;

  // only emit `accountsChanged` event if public key changed
  if (changed) {
    console.log(
      "[keplr-eth] account change detected, from: %s to: %s",
      currentPublicKeyRaw,
      publicKeyNormalized,
    );

    const provider = this.getEthereumProvider();

    if (publicKeyNormalized === null) {
      this.state = {
        publicKey: null,
        publicKeyRaw: null,
        address: null,
      };

      provider.emit("accountsChanged", []);
      return;
    } else {
      const publicKeyHex: Hex = `0x${publicKeyNormalized}`;
      const nextAddress = publicKeyToEthereumAddress(publicKeyHex);

      this.state = {
        publicKeyRaw: publicKey,
        publicKey: publicKeyHex,
        address: nextAddress,
      };

      provider.emit("accountsChanged", [nextAddress]);
    }
  }
}

function normalizeKey(key: string | null): string | null {
  if (key === null || key === "") {
    return null;
  }

  if (key.toLowerCase().startsWith("0x")) {
    return key.slice(2).toLowerCase();
  } else {
    return key.toLowerCase();
  }
}
