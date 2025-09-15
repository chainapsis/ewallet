import type { Result } from "@keplr-ewallet/stdlib-js";

import type {
  EWalletMsg,
  KeplrEWalletInterface,
} from "@keplr-ewallet-sdk-core/types";
import type { InitPayload } from "@keplr-ewallet-sdk-core/types/init";
import { handleOAuthSignInResult } from "./oauth_sign_in_result";

// Only used for "init" message which is triggered by the child.
// After initialization, message communication is only triggered
// by parent window and child replies on the dedicated channel
export function registerMsgListener(
  eWallet: KeplrEWalletInterface,
): Promise<Result<InitPayload, string>> {
  if (window.__keplr_ewallet_ev) {
    // TODO: unreachable but is allowed. Report to centralized logging system
    // required
    console.error("[keplr] isn't it already initailized?");
  }

  return new Promise((resolve, reject) => {
    async function handler(event: MessageEvent) {
      const msg = event.data as EWalletMsg;

      switch (msg.msg_type) {
        case "init": {
          resolve(msg.payload);
          break;
        }

        case "oauth_sign_in_result": {
          await handleOAuthSignInResult(eWallet);
          break;
        }

        default: {
          throw new Error("unreachable");
        }
      }

      // if (msg.msg_type === "init") {
      //   window.removeEventListener("message", handler);
      //
      //   // Resolve regardless, caller can branch on payload.success
      //   resolve(msg.payload);
      // }
    }

    window.addEventListener("message", handler);
    window.__keplr_ewallet_ev = handler;
    console.log("[keplr] msg listener registered");
  });
}
