import type {
  KeplrEWalletCoreEventHandler,
  KeplrEWalletCoreEventHandler2,
  KeplrEWalletCoreEventName,
  KeplrEWalletInterface,
} from "@keplr-ewallet-sdk-core/types";

export async function on(
  this: KeplrEWalletInterface,
  handlerDef: KeplrEWalletCoreEventHandler2,
) {
  // if already initialized or init failed, call handler immediately
  // if (eventName === "_init") {
  //   const initHandler = handler as KeplrEWalletCoreEventHandler<"_init">;
  //
  //   if (this.isInitialized) {
  //     initHandler({
  //       success: true,
  //       data: {
  //         email: this.email,
  //         publicKey: this.publicKey,
  //       },
  //     });
  //     return;
  //   } else if (this.initError) {
  //     initHandler({
  //       success: false,
  //       err: this.initError,
  //     });
  //     return;
  //   }
  // }

  this.eventEmitter.on(handlerDef);
}
