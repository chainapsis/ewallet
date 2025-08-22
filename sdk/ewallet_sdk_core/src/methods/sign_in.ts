import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { tryGoogleSignIn } from "./google";

export async function signIn(this: KeplrEWallet, type: "google") {
  const isSuccess = await (async () => {
    // cannot await init, because it will block the popup window
    // CHECK: open popup first, then await init?
    if (!this.isInitialized) {
      throw new Error(this.initError ?? "EWallet is not initialized");
    }

    switch (type) {
      case "google": {
        await tryGoogleSignIn(
          this.sdkEndpoint,
          this.apiKey,
          this.sendMsgToIframe,
        );
        return true;
      }
      default:
        return false;
    }
  })();

  if (!isSuccess) {
    throw Error(`invalid type: ${type}`);
  }

  const publicKey = await this.getPublicKey();
  const email = await this.getEmail();
  console.log(11, publicKey, email);

  if (!!publicKey && !!email) {
    console.log("[keplr] emit _accountsChanged");

    this.eventEmitter.emit("_accountsChanged", {
      email,
      publicKey,
    });
  }
}
