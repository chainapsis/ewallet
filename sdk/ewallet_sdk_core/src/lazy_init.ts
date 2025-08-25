import { KEPLR_IFRAME_ID } from "@keplr-ewallet-sdk-core/init/iframe";
import { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { registerMsgListener } from "@keplr-ewallet-sdk-core/window_msg/listener";
import type {
  AckPayload,
  EWalletMsgInit,
  InitResult,
  KeplrEWalletInterface,
  KeplrEWalletState,
} from "@keplr-ewallet-sdk-core/types";
import type { Result } from "@keplr-ewallet/stdlib-js";

export async function lazyInit(
  this: KeplrEWalletInterface,
): Promise<Result<void, string>> {
  if (this.state !== null) {
    return { success: true, data: void 0 };
    // return { success: true, data: this.state };
  }
  // If keplr_ewallet is initialized, iframe should exist
  // const el = document.getElementById(KEPLR_IFRAME_ID);
  // if (el !== null) {
  //   return {
  //     success: false,
  //     err: "iframe not exists even after Keplr eWallet initialization",
  //   };
  // }

  // const checkURLRes = await checkURL(args.sdk_endpoint);
  // if (!checkURLRes.success) {
  //   return checkURLRes;
  // }
  //
  const registerRes = await registerMsgListener();
  if (registerRes.success) {
    return { success: true, data: void 0 };
  } else {
    return {
      success: false,
      err: "msg listener register fail",
    };
  }
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
