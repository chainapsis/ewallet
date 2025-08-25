import {
  initKeplrEwalletCore,
  type KeplrEwalletInitArgs,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import { CosmosEWallet } from "../cosmos_ewallet";

export type CosmosEWalletArgs = KeplrEwalletInitArgs;

export function init(args: CosmosEWalletArgs): Result<CosmosEWallet, string> {
  const eWalletRes = initKeplrEwalletCore(args);
  if (!eWalletRes.success) {
    console.error(
      "[keplr] cosmos, ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return eWalletRes;
  }

  return { success: true, data: new CosmosEWallet(eWalletRes.data) };
}
