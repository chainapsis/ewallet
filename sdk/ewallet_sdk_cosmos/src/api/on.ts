import type { KeplrEWalletEventType } from "@keplr-ewallet/ewallet-sdk-core";

import type { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function on(
  this: CosmosEWallet,
  eventType: KeplrEWalletEventType,
  handler: Function, // TODO:
) {}
