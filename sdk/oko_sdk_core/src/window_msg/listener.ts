import type { Result } from "@oko-wallet/stdlib-js";

import type {
  EWalletMsg,
  EWalletMsgInitAck,
  KeplrEWalletInterface,
} from "@oko-wallet-sdk-core/types";
import type { InitPayload } from "@oko-wallet-sdk-core/types/init";

export function registerMsgListener(
  _eWallet: KeplrEWalletInterface,
): Promise<Result<InitPayload, string>> {
  if (window.__keplr_ewallet_ev) {
    // TODO: theoretically unreachable but this can happen
    // Later we will report to centralized logging system
    console.error("[keplr] isn't it already initailized?");
  }

  return new Promise((resolve, reject) => {
    async function handler(event: MessageEvent) {
      if (event.ports.length < 1) {
        // do nothing

        return;
      }

      const port = event.ports[0];
      const msg = event.data as EWalletMsg;

      if (msg.msg_type === "init") {
        const ack: EWalletMsgInitAck = {
          target: "oko_attached",
          msg_type: "init_ack",
          payload: { success: true, data: null },
        };

        port.postMessage(ack);

        window.removeEventListener("message", handler);

        resolve(msg.payload);
      } else {
      }
    }

    window.addEventListener("message", handler);
    window.__keplr_ewallet_ev = handler;
    console.log("[keplr] msg listener registered");
  });
}
