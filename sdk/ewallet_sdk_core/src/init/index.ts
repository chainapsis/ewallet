import { type Result } from "@keplr-ewallet/stdlib-js";

import { setupIframeElement } from "./iframe";
import type { KeplrEwalletInitArgs } from "@keplr-ewallet-sdk-core/types";
import { registerMsgListener } from "@keplr-ewallet-sdk-core/window_msg/listener";
import { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

const SDK_ENDPOINT = `https://attached.embed.keplr.app`;
const KEPLR_EWALLET_ELEM_ID = "keplr-ewallet";

export async function initKeplrEwalletCore(
  args: KeplrEwalletInitArgs,
): Promise<Result<KeplrEWallet, string>> {
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

  const checkURLRes = await checkURL(args.sdk_endpoint);
  if (!checkURLRes.success) {
    return checkURLRes;
  }

  const registering = registerMsgListener();

  const sdkEndpoint = checkURLRes.data;
  console.log("[keplr] resolved sdk endpoint: %s", sdkEndpoint);

  const iframeRes = setupIframeElement(sdkEndpoint);
  if (!iframeRes.success) {
    return iframeRes;
  }

  const iframe = iframeRes.data;

  // Wait till the "init" message is sent from the being-loaded iframe document.
  const listenerRes = await registering;
  if (!listenerRes) {
    return {
      success: false,
      err: "Attached initialize fail",
    };
  }

  const ewalletCore = new KeplrEWallet(args.api_key, iframe, sdkEndpoint);

  window.__keplr_ewallet = ewalletCore;

  const hostOriginRes = await getHostOrigin();
  if (!hostOriginRes.success) {
    return hostOriginRes;
  }

  const hostOrigin = hostOriginRes.data;
  const initStateRes = await ewalletCore.registerOrigin(hostOrigin);
  if (!initStateRes.success) {
    return initStateRes;
  }

  return { success: true, data: ewalletCore };
}

async function checkURL(url?: string): Promise<Result<string, string>> {
  const _url = url ?? SDK_ENDPOINT;

  try {
    const response = await fetch(_url, { mode: "no-cors" });
    if (!response.ok) {
      return { success: true, data: _url };
    } else {
      return {
        success: false,
        err: `SDK endpoint, resp contains err, url: ${_url}`,
      };
    }
  } catch (err: any) {
    console.error("[keplr] check url fail, url: %s", _url);

    return { success: false, err: `check url fail, ${err.toString()}` };
  }
}

async function getHostOrigin(): Promise<Result<string, string>> {
  try {
    const hostOrigin = new URL(window.location.toString()).origin;

    return { success: true, data: hostOrigin };
  } catch (err: any) {
    console.error("[keplr] get host origin fail");

    return {
      success: false,
      err: `get host origin fail, ${err.toString()}`,
    };
  }
}
