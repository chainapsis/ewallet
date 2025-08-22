import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export function setUpEventHandlers(this: CosmosEWallet): void {
  console.log("[keplr] set up event handlers");

  this.eWallet.on("_accountsChanged", (payload: any) => {
    if (this.eventEmitter) {
      this.eventEmitter.emit("accountsChanged", payload);
    }
  });

  this.eWallet.on("_chainChanged", (payload: any) => {
    if (this.eventEmitter) {
      this.eventEmitter.emit("chainChanged", payload);
    }
  });
}
