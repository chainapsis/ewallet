/*
 Check Cross-Origin-Opener-Policy header.
 If the page that opened the popup has a Cross-Origin-Opener-Policy of `same-origin` or 
 `same-origin-allow-popups`, the popup cannot access `window.opener.frames`, which makes it
 impossible to send a message to the iframe. As a result, this flow cannot be handled.
 */

import type { Result } from "@keplr-ewallet/stdlib-js";
import type { EWalletMsg, OAuthState } from "@keplr-ewallet/ewallet-sdk-core";
import { RedirectUriSearchParamsKey } from "@keplr-ewallet/ewallet-sdk-core";
import { EWALLET_SDK_TARGET } from "@keplr-ewallet-attached/window_msgs/target";

export async function handleGoogleCallback() {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get("access_token");
  const idToken = params.get("id_token");

  const oauthState: OAuthState = JSON.parse(
    params.get(RedirectUriSearchParamsKey.STATE) || "{}",
  );

  const customerId = oauthState.customerId;
  const targetOrigin = oauthState.targetOrigin;

  if (accessToken && idToken && targetOrigin && customerId) {
    const foundRes = await passTheTokenToEWalletAttachedWindow(
      accessToken,
      idToken,
      customerId,
      targetOrigin,
    );

    if (foundRes.success === false) {
      console.error("[attached] passing token failed, err: %s", foundRes.err);
      return;
    }

    const found = foundRes.data;

    if (!found) {
      console.error("[attached] iframe not found");
      return;
    }
  } else {
    console.error("[attached] No token to pass");
  }

  window.close();
}

async function passTheTokenToEWalletAttachedWindow(
  accessToken: string,
  idToken: string,
  customerId: string,
  targetOrigin: string,
): Promise<Result<boolean, string>> {
  let found = false;

  const myUrl = window.location.toString();
  const normalizedIframeOrigin = new URL(myUrl).origin;

  const msg: EWalletMsg = {
    target: "keplr_ewallet_attached",
    msg_type: "oauth_sign_in",
    payload: {
      access_token: accessToken,
      id_token: idToken,
      customer_id: customerId,
      target_origin: targetOrigin,
    },
  };

  // TODO: timeout @elden
  try {
    for (let i = 0; i < window.opener.frames.length; i++) {
      try {
        const frame = window.opener.frames[i];
        if (frame.location.origin === normalizedIframeOrigin) {
          await sendMsgToIframe(frame, msg, normalizedIframeOrigin);

          found = true;
          break;
        }
      } catch (err: any) {
        return { success: false, err: err.toString() };
      }
    }
  } catch (err: any) {
    return { success: false, err: err.toString() };
  }

  return { success: true, data: found };
}

function sendMsgToIframe(frame: any, msg: EWalletMsg, targetOrigin: string) {
  return new Promise<EWalletMsg>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (obj: any) => {
      const data = obj.data as EWalletMsg;

      channel.port1.close();

      if (data.payload) {
        resolve(data);
      } else {
        resolve({
          target: EWALLET_SDK_TARGET,
          msg_type: "unknown_msg_type",
          payload: JSON.stringify(data),
        });
      }
    };

    frame.postMessage(msg, targetOrigin, [channel.port2]);
  });
}

export interface GoogleTokenInfo {
  alg: string;
  at_hash: string;
  aud: string;
  azp: string;
  email: string;
  email_verified: string;
  exp: string;
  family_name: string;
  given_name: string;
  hd: string;
  iat: string;
  iss: string;
  jti: string;
  kid: string;
  name: string;
  nbf: string;
  nonce: string;
  picture: string;
  sub: string;
  typ: string;
}
