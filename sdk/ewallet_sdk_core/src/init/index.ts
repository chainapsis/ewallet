import { type Result } from "@keplr-ewallet/stdlib-js";

import { setUpIframeElement } from "./iframe";
import type {
  KeplrEwalletInitArgs,
  KeplrEWalletInterface,
} from "@keplr-ewallet-sdk-core/types";
import { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

const SDK_ENDPOINT = `https://attached.embed.keplr.app`;

export function initKeplrEwalletCore(
  args: KeplrEwalletInitArgs,
): Result<KeplrEWalletInterface, string> {
  try {
    if (window.__keplr_ewallet_locked === true) {
      console.warn(
        "keplr ewallet init is locked. Is init being exeucted concurrently?",
      );
    } else {
      window.__keplr_ewallet_locked = true;
    }

    console.log("[keplr] init");
    console.log("[keplr] sdk endpoint: %s", args.sdk_endpoint);

    if (window === undefined) {
      console.error("[keplr] EWallet can only be initialized in the browser");

      return {
        success: false,
        err: "Not in the browser context",
      };
    }

    if (window.__keplr_ewallet) {
      console.warn("[keplr] already initialized");

      return { success: true, data: window.__keplr_ewallet };
    }

    const hostOrigin = new URL(window.location.toString()).origin;
    if (hostOrigin.length === 0) {
      return {
        success: false,
        err: "Host origin empty",
      };
    }

    const sdkEndpoint = args.sdk_endpoint ?? SDK_ENDPOINT;

    // Check if endpoint is valid url format
    let sdkEndpointURL;
    try {
      sdkEndpointURL = new URL(sdkEndpoint);
      sdkEndpointURL.searchParams.append("host_origin", hostOrigin);
    } catch (err) {
      return {
        success: false,
        err: "SDK endpoint is not a valid url",
      };
    }

    console.log("[keplr] resolved sdk endpoint: %s", sdkEndpoint);
    console.log("[keplr] host origin: %s", hostOrigin);

    const iframeRes = setUpIframeElement(sdkEndpointURL);
    if (!iframeRes.success) {
      return iframeRes;
    }

    const iframe = iframeRes.data;

    const ewalletCore = new (KeplrEWallet as any)(
      args.api_key,
      iframe,
      sdkEndpoint,
    );

    if (window.__keplr_ewallet) {
      console.warn("[keplr] ewallet has been initialized by another process");

      return { success: true, data: window.__keplr_ewallet };
    } else {
      window.__keplr_ewallet = ewalletCore;
      return { success: true, data: ewalletCore };
    }
  } catch (err) {
    throw new Error("[keplr] sdk init fail, unreachable");
  } finally {
    if (window.__keplr_ewallet_locked === true) {
      window.__keplr_ewallet_locked = false;
    }
  }
}
