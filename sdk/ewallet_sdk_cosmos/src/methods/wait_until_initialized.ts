import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function waitUntilInitialized(this: CosmosEWallet): Promise<void> {
  console.log("[keplr] waitUntilInitialized: start");

  try {
    // if (!this.eWallet.isInitialized) {
    //   if (this.eWallet.initError) {
    //     throw new Error(this.eWallet.initError);
    //   }
    //   console.log(
    //     "[cosmos] waitUntilInitialized: awaiting core initialization",
    //   );
    //   await this.eWallet.waitUntilInitialized;
    // } else {
    //   console.log("[cosmos] waitUntilInitialized: core already initialized");
    // }
  } catch (error: any) {
    console.error("[keplr] waitUntilInitialized failed with error:", error);
    throw error;
  }
}
