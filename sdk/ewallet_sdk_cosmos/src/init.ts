import {
  initKeplrEwalletCore,
  type KeplrEwalletInitArgs,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import { CosmosEWallet } from "./cosmos_ewallet.js";

export type CosmosEWalletArgs = KeplrEwalletInitArgs;

export async function initCosmosEWallet(
  args: CosmosEWalletArgs,
): Promise<Result<CosmosEWallet, string>> {
  const eWalletRes = await initKeplrEwalletCore(args);
  if (!eWalletRes.success) {
    console.error("[keplr] ewallet core init failed, err: %s", eWalletRes.err);

    return eWalletRes;
  }

  return { success: true, data: new CosmosEWallet(eWalletRes.data) };
}
