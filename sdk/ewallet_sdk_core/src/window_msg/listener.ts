import type {
  AckPayload,
  EWalletMsg,
  InitResult,
} from "@keplr-ewallet-sdk-core/types";

// Only used for "init" message which is triggered by the child.
// After initialization, message communication is only triggered
// by parent window and child replies on the dedicated channel
export function registerMsgListener(): Promise<AckPayload<InitResult>> {
  if (window.__keplr_ewallet_ev) {
    console.warn("[keplr] isn't it already initailized?");
  }

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      const msg = event.data as EWalletMsg;
      if (msg.msg_type === "init") {
        window.removeEventListener("message", handler);
        // Resolve regardless, caller can branch on payload.success
        resolve(msg.payload);
      }
    };

    window.addEventListener("message", handler);
    window.__keplr_ewallet_ev = handler;
    console.log("[keplr] msg listener registered");
  });
}
