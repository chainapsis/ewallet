import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function waitUntilInitialized(this: CosmosEWallet): Promise<void> {
  try {
    //
  } catch (error: any) {
    console.error("[cosmos] waitUntilInitialized failed with error:", error);
    throw error;
  }
}
