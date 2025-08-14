import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { tryGoogleSignIn } from "./google";

export async function signIn(this: KeplrEWallet, type: "google") {
  const isSuccess = await (async () => {
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

  if (isSuccess) {
    const publicKey = await this.getPublicKey();
    const email = await this.getEmail();
    if (!!publicKey && !!email) {
      this.eventEmitter.emit("accountsChanged", {
        email,
        publicKey,
      });
    }
  }

  throw Error(`invalid type: ${type}`);
}
