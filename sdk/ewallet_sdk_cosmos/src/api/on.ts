import type { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function on(
  this: CosmosEWallet,
  eventType: KeplrEWalletEventType,
  handler: () => void,
) { }
