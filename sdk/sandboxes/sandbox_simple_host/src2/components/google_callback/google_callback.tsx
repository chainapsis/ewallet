import React from "react";
import { useLocation } from "react-router";
import { RedirectUriSearchParamsKey } from "@keplr-ewallet/ewallet-sdk-core";

import { handleGoogleCallback } from "@keplr-ewallet-attached/auth/google";

// function isFromConnectState(state: string): boolean {
//   try {
//     const parsed = JSON.parse(state);
//     return (
//       typeof parsed === "object" &&
//       parsed !== null &&
//       !!parsed.requestOrigin &&
//       !!parsed.keplrEwalletAppId
//       // connect is not required
//     );
//   } catch {
//     return false;
//   }
// }

function handleConnect(params: URLSearchParams) {
  const accessToken = params.get("access_token");
  const idToken = params.get("id_token");
  const state = params.get("state");

  if (!accessToken || !idToken || !state) throw new Error("invalid state");

  const parsedState = JSON.parse(state);

  const targetOrigin = parsedState.requestOrigin;
  const keplrEwalletAppId = parsedState.keplrEwalletAppId;
  let connect = false;

  if (parsedState.connect === "true") {
    connect = true;
  }

  const currentOrigin = window.location.origin;
  const oauthProvider = "google";

  const redirectUrl = new URL(`${currentOrigin}/connect`);

  redirectUrl.searchParams.set("oauthProvider", oauthProvider);
  redirectUrl.searchParams.set("accessToken", accessToken);
  redirectUrl.searchParams.set("idToken", idToken);
  redirectUrl.searchParams.set("targetOrigin", targetOrigin);
  redirectUrl.searchParams.set("keplrEwalletAppId", keplrEwalletAppId);
  redirectUrl.searchParams.set("connect", connect.toString());

  // redirect to connect page
  window.location.href = redirectUrl.toString();
}

export const GoogleCallback: React.FC = () => {
  console.log("[attached] GoogleCallback render");

  const { hash } = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(hash.substring(1));
    const state = params.get(RedirectUriSearchParamsKey.STATE);

    if (!origin) {
      console.error(`${RedirectUriSearchParamsKey.STATE} 
needs to be present in the search params`);
      return;
    }

    handleGoogleCallback();
  }, []);

  return <div>google</div>;
};
