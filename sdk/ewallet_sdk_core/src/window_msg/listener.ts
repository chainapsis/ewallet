import type { EWalletMsg } from "@keplr-ewallet-sdk-core/types";

// Only used for "init" message which is triggered by the child.
// After initialization, message communication is only triggered
// by parent window and child replies on the dedicated channel
export function registerMsgListener(): Promise<boolean> {
  if (window.__keplr_ewallet_ev) {
    console.warn("[keplr] isn't it already initailized?");
  }

  // Callback ref to remember
  const callback: ((b: boolean) => void)[] = [];
  const prom = new Promise<boolean>((resolve) => {
    callback.push(resolve);
  });

  async function msgHandler(event: MessageEvent) {
    const msg = event.data as EWalletMsg;

    switch (msg.msg_type) {
      case "init": {
        if (callback.length > 1) {
          throw new Error(
            "[keplr] ewallet msg handler init callback should exist",
          );
        }

        const cb = callback[0];
        if (!msg.payload.success) {
          console.error(`[keplr] attached init fail, err: ${msg.payload.err}`);

          cb(false);
        } else {
          cb(true);
        }
      }
    }
  }

  window.addEventListener("message", msgHandler);
  window.__keplr_ewallet_ev = msgHandler;

  console.log("[keplr] msg listener registered");

  return prom;
}
