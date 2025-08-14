import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { tryGoogleSignIn } from "./google";

export async function signIn(this: KeplrEWallet, type: "google") {
  switch (type) {
    case "google": {
      return await tryGoogleSignIn(
        this.sdkEndpoint,
        this.apiKey,
        this.sendMsgToIframe,
      );

      // xxx.emit('addressChanged', payload);
    }
    default:
      throw Error(`invalid type: ${type}`);
  }
}
