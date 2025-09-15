import { EWALLET_ATTACHED_TARGET } from "@keplr-ewallet-sdk-core/window_msg/target";
import type {
  KeplrEWalletInterface,
  OAuthState,
  EWalletMsg,
  EWalletMsgOAuthSignInResult,
  EWalletMsgOAuthSignInResultAck,
} from "@keplr-ewallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@keplr-ewallet-sdk-core/types/oauth";
import { GOOGLE_CLIENT_ID } from "@keplr-ewallet-sdk-core/auth";

const FIVE_MINS_MS = 5 * 60 * 1000;

export async function signIn(this: KeplrEWalletInterface, type: "google") {
  let signInRes: EWalletMsgOAuthSignInResult;
  try {
    switch (type) {
      case "google": {
        signInRes = await tryGoogleSignIn(
          this.sdkEndpoint,
          this.apiKey,
          this.sendMsgToIframe.bind(this),
        );
        break;
      }
      default:
        throw new Error(`not supported sign in type, type: ${type}`);
    }
  } catch (err) {
    throw new Error(`Sign in error, err: ${err}`);
  }

  if (!signInRes.payload.success) {
    throw new Error(`sign in fail, err: ${signInRes.payload.err}`);
  }

  const msg: EWalletMsg = {
    target: "keplr_ewallet_attached",
    msg_type: "oauth_sign_in",
    payload: signInRes.payload.data,
  };

  await this.sendMsgToIframe(msg);

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
): Promise<EWalletMsgOAuthSignInResult> {
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

  // NOTE: Safari browser sets a strict rule in the amount of time a script
  // can handle function that involes window.open(). window.open() had better
  // be executed without awaiting any long operations
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

  return new Promise<EWalletMsgOAuthSignInResult>(async (resolve, reject) => {
    // let focusTimer: number;
    let timeout: number;

    // function onFocus(e: FocusEvent) {
    //   // when user focus back to the parent window, check if the popup is closed
    //   // a small delay to handle the case message is sent but not received yet
    //   focusTimer = window.setTimeout(() => {
    //     if (popup && popup.closed) {
    //       cleanup();
    //       reject(new Error("Window closed by user"));
    //       closePopup(popup);
    //     }
    //   }, 200);
    // }
    // window.addEventListener("focus", onFocus);

    function onMessage(event: MessageEvent) {
      if (event.ports.length < 1) {
        // do nothing

        return;
      }

      const port = event.ports[0];
      const data = event.data as EWalletMsg;

      if (data.msg_type === "oauth_sign_in_result") {
        console.log("[keplr] oauth_sign_in_result recv, %o", data);

        const msg: EWalletMsgOAuthSignInResultAck = {
          target: "keplr_ewallet_attached",
          msg_type: "oauth_sign_in_result_ack",
          payload: null,
        };

        port.postMessage(msg);

        if (data.payload.success) {
          resolve(data);
        } else {
          reject(new Error(data.payload.err.type));
        }

        cleanup();
      }
    }
    window.addEventListener("message", onMessage);

    timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout: no response within 5 minutes"));
      closePopup(popup);
    }, FIVE_MINS_MS);

    function cleanup() {
      console.log("[keplr] clean up oauth sign in listener");

      // window.clearTimeout(focusTimer);
      // window.removeEventListener("focus", onFocus);

      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
    }
  });
}

function closePopup(popup: Window) {
  if (popup && !popup.closed) {
    popup.close();
  }
}
