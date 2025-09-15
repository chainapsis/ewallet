import { registerMsgListener } from "@keplr-ewallet-sdk-core/window_msg/listener";
import type {
  KeplrEWalletInterface,
  KeplrEWalletState,
} from "@keplr-ewallet-sdk-core/types";
import type { Result } from "@keplr-ewallet/stdlib-js";

import { KEPLR_IFRAME_ID } from "@keplr-ewallet-sdk-core/iframe";

export async function lazyInit(
  eWallet: KeplrEWalletInterface,
): Promise<Result<KeplrEWalletState, string>> {
  // If keplr_ewallet is initialized, iframe should exist
  const el = document.getElementById(KEPLR_IFRAME_ID);
  if (el === null) {
    return {
      success: false,
      err: "iframe not exists even after Keplr eWallet initialization",
    };
  }

  const checkURLRes = await checkURL(eWallet.sdkEndpoint);
  if (!checkURLRes.success) {
    return checkURLRes;
  }

  const registerRes = await registerMsgListener(eWallet);
  if (registerRes.success) {
    const initResult = registerRes.data;
    const { email, public_key } = initResult;

    eWallet.state = { email, publicKey: public_key };

    if (email && public_key) {
      eWallet.eventEmitter.emit({
        type: "CORE__accountsChanged",
        email: email,
        publicKey: public_key,
      });
    }

    return { success: true, data: eWallet.state };
  } else {
    return {
      success: false,
      err: "msg listener register fail",
    };
  }
}

async function checkURL(url: string): Promise<Result<string, string>> {
  try {
    const response = await fetch(url, { mode: "no-cors" });
    if (!response.ok) {
      return { success: true, data: url };
    } else {
      return {
        success: false,
        err: `SDK endpoint, resp contains err, url: ${url}`,
      };
    }
  } catch (err: any) {
    console.error("[keplr] check url fail, url: %s", url);

    return { success: false, err: `check url fail, ${err.toString()}` };
  }
}
