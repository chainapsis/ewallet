import { type Result } from "@keplr-ewallet/stdlib-js";

import { setupIframeElement } from "./iframe";
import type { KeplrEwalletInitArgs } from "@keplr-ewallet-sdk-core/types";
import { registerMsgListener } from "@keplr-ewallet-sdk-core/window_msg/listener";
import { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

const SDK_ENDPOINT = `https://attached.embed.keplr.app`;
const KEPLR_EWALLET_ELEM_ID = "keplr-ewallet";

export function initKeplrEwalletCore(
  args: KeplrEwalletInitArgs,
): Result<KeplrEWallet, string> {
  console.debug("[keplr] init");
  console.debug("[keplr] sdk endpoint: %s", args.sdk_endpoint);

  if (window === undefined) {
    console.error("[keplr] EWallet can only be initialized in the browser");

    return {
      success: false,
      err: "Not in the browser context",
    };
  }

  if (window.__keplr_ewallet) {
    const el = document.getElementById(KEPLR_EWALLET_ELEM_ID);
    if (el !== null) {
      return {
        success: false,
        err: "Some problem occurred during Keplr eWallet initialization",
      };
    }

    console.debug("[keplr] already initialized");
    return { success: true, data: window.__keplr_ewallet };
  }

  // not sure sdk endpoint is valid just by fetching it
  // const checkURLRes = await checkURL(args.sdk_endpoint);
  // if (!checkURLRes.success) {
  //   return checkURLRes;
  // }

  // just check if sdk endpoint is valid url format
  const sdkEndpoint = args.sdk_endpoint ?? SDK_ENDPOINT;

  try {
    new URL(sdkEndpoint);
  } catch (err) {
    return {
      success: false,
      err: "SDK endpoint is not a valid url",
    };
  }

  const initPromise = registerMsgListener();

  const hostOrigin = new URL(window.location.toString()).origin;
  if (hostOrigin.length === 0) {
    return {
      success: false,
      err: "Host origin empty",
    };
  }

  const sdkEndpointURL = new URL(sdkEndpoint);
  sdkEndpointURL.searchParams.append("host_origin", hostOrigin);

  console.log("[keplr] resolved sdk endpoint: %s", sdkEndpoint);
  console.log("[keplr] host origin: %s", hostOrigin);

  const iframeRes = setupIframeElement(sdkEndpointURL);
  if (!iframeRes.success) {
    return iframeRes;
  }

  const iframe = iframeRes.data;

  // Do not await initialization here; expose it to the consumer for lazy init
  const ewalletCore = new KeplrEWallet(
    args.api_key,
    iframe,
    sdkEndpoint,
    initPromise,
  );

  window.__keplr_ewallet = ewalletCore;

  return { success: true, data: ewalletCore };
}

// async function checkURL(url?: string): Promise<Result<string, string>> {
//   const _url = url ?? SDK_ENDPOINT;

//   try {
//     const response = await fetch(_url, { mode: "no-cors" });
//     if (!response.ok) {
//       return { success: true, data: _url };
//     } else {
//       return {
//         success: false,
//         err: `SDK endpoint, resp contains err, url: ${_url}`,
//       };
//     }
//   } catch (err: any) {
//     console.error("[keplr] check url fail, url: %s", _url);

//     return { success: false, err: `check url fail, ${err.toString()}` };
//   }
// }
