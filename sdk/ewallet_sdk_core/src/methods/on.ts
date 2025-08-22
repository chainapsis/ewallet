import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type {
  KeplrEWalletCoreEventHandler,
  KeplrEWalletCoreEventName,
  KeplrEWalletCoreOn,
} from "@keplr-ewallet-sdk-core/types";

async function _on<N extends KeplrEWalletCoreEventName>(
  this: KeplrEWallet,
  eventName: N,
  handler: KeplrEWalletCoreEventHandler<N>,
) {
  if (this.eventEmitter) {
    if (eventName === "_init") {
      if (this.isInitialized) {
        const initHandler = handler as KeplrEWalletCoreEventHandler<"_init">;
        initHandler({
          success: true,
          data: {
            publicKey: this.publicKey,
          },
        });
      } else if (this.initError) {
        const initHandler = handler as KeplrEWalletCoreEventHandler<"_init">;
        initHandler({
          success: false,
          err: this.initError,
        });
      } else {
        const initHandler = handler as KeplrEWalletCoreEventHandler<"_init">;
        this.eventEmitter.on("_init", initHandler);
      }
      return;
    }

    this.eventEmitter.on(eventName, handler);
  }
}

export const on = _on as KeplrEWalletCoreOn;
