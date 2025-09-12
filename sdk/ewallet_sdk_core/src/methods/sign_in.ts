import { EWALLET_ATTACHED_TARGET } from "@keplr-ewallet-sdk-core/window_msg/target";
import type {
  KeplrEWalletInterface,
  OAuthState,
  EWalletMsg,
} from "@keplr-ewallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@keplr-ewallet-sdk-core/types/oauth";
import { GOOGLE_CLIENT_ID } from "@keplr-ewallet-sdk-core/auth";

const FIVE_MINS_MS = 5 * 60 * 1000;

export async function signIn(this: KeplrEWalletInterface, type: "google") {
  switch (type) {
    case "google": {
      await tryGoogleSignIn(
        this.sdkEndpoint,
        this.apiKey,
        this.sendMsgToIframe.bind(this),
      );
      break;
    }
    default:
      throw new Error(`not supported sign in type, type: ${type}`);
  }

  const publicKey = await this.getPublicKey();
  const email = await this.getEmail();

  if (!!publicKey && !!email) {
    console.log("[keplr] emit CORE__accountsChanged");

    this.eventEmitter.emit({
      type: "CORE__accountsChanged",
      email,
      publicKey,
    });
  }
}

async function tryGoogleSignIn(
  sdkEndpoint: string,
  apiKey: string,
  sendMsgToIframe: (msg: EWalletMsg) => Promise<EWalletMsg>,
) {
  const clientId = GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }

  const redirectUri = `${new URL(sdkEndpoint).origin}/google/callback`;

  console.debug("[keplr] window host: %s", window.location.host);
  console.debug("[keplr] redirectUri: %s", redirectUri);

  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // NOTE: safari browser block the new window when async operation is used
  // between user interaction and window opening.
  // so we need to send the message to iframe first and wait for the ack after window opening.
  const ackPromise = sendMsgToIframe({
    target: EWALLET_ATTACHED_TARGET,
    msg_type: "set_oauth_nonce",
    payload: nonce,
  });

  const oauthState: OAuthState = {
    apiKey,
    targetOrigin: window.location.origin,
  };
  const oauthStateString = JSON.stringify(oauthState);

  console.debug("[keplr] oauthStateString: %s", oauthStateString);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);

  // Google implicit auth flow
  // See https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
  authUrl.searchParams.set("response_type", "token id_token");

  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "login");
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set(RedirectUriSearchParamsKey.STATE, oauthStateString);

  const popup = window.open(
    authUrl.toString(),
    "google_oauth",
    "width=1200,height=800",
  );

  if (!popup) {
    throw new Error("Failed to open new window for google oauth sign in");
  }

  const ack = await ackPromise;
  if (ack.msg_type !== "set_oauth_nonce_ack" || !ack.payload.success) {
    // Closing will be handled in the popup window
    // popup.close();
    throw new Error("Failed to set nonce for google oauth sign in");
  }

  return new Promise<void>((resolve, reject) => {
    let focusTimer: number;
    let requestTimer: number;

    function onFocus(e: FocusEvent) {
      // when user focus back to the parent window, check if the popup is closed
      // a small delay to handle the case message is sent but not received yet
      focusTimer = window.setTimeout(() => {
        if (popup && popup.closed) {
          cleanup();
          reject(new Error("Window closed by user"));
        }
      }, 200);
    }
    window.addEventListener("focus", onFocus);

    function onMessage(e: MessageEvent) {
      const data = e.data as EWalletMsg;

      if (data.msg_type === "oauth_sign_in_ack") {
        // cleanup();
        if (data.payload.success) {
          resolve();
        } else {
          reject(new Error(data.payload.err.type));
        }
      }
    }
    window.addEventListener("message", onMessage);

    requestTimer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout: no response within 5 minutes"));
    }, FIVE_MINS_MS);

    function cleanup() {
      window.clearTimeout(focusTimer);
      window.clearTimeout(requestTimer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("message", onMessage);

      if (popup && !popup.closed) {
        popup.close();
      }
    }
  });
}
