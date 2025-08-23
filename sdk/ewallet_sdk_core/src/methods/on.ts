import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type {
  KeplrEWalletCoreEventHandler,
  KeplrEWalletCoreEventName,
} from "@keplr-ewallet-sdk-core/types";

async function _on<N extends KeplrEWalletCoreEventName>(
  this: KeplrEWallet,
  eventName: N,
  handler: KeplrEWalletCoreEventHandler<N>,
) {
  if (this.eventEmitter) {
    // if already initialized or init failed, call handler immediately
    if (eventName === "_init") {
      const initHandler = handler as KeplrEWalletCoreEventHandler<"_init">;
      if (this.isInitialized) {
        initHandler({
          success: true,
          data: {
            email: this.email,
            publicKey: this.publicKey,
          },
        });
        return;
      } else if (this.initError) {
        initHandler({
          success: false,
          err: this.initError,
        });
        return;
      }
    }

    this.eventEmitter.on(eventName, handler);
  }
}

export const on = _on as <N extends KeplrEWalletCoreEventName>(
  eventName: N,
  handler: KeplrEWalletCoreEventHandler<N>,
) => void;
