import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export function setUpEventHandlers(this: CosmosEWallet): void {
  console.log("[cosmos] set up event handlers");

  this.eWallet.on("_init", (payload) => {
    console.log("[cosmos] _init callback, payload: %s", payload);

    if (payload.success) {
      if (payload.data.publicKey) {
        console.log(
          "[cosmos] _init callback, publicKey: %s",
          payload.data.publicKey,
        );

        // CHECK: compare to cached public key
        this.publicKey = Buffer.from(payload.data.publicKey, "hex");
      } else {
        this.publicKey = null;
      }
    } else {
      console.log("[cosmos] _init callback, error: %s", payload.err);
      this.publicKey = null;
    }
  });

  this.eWallet.on("_accountsChanged", (payload) => {
    if (payload.publicKey) {
      this.publicKey = Buffer.from(payload.publicKey, "hex");
    } else {
      this.publicKey = null;
    }

    if (this.eventEmitter) {
      this.eventEmitter.emit("accountsChanged", payload);
    }
  });

  this.eWallet.on("_chainChanged", (payload) => {
    if (this.eventEmitter) {
      this.eventEmitter.emit("chainChanged", payload);
    }
  });
}
