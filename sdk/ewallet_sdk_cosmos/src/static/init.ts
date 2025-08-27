import {
  KeplrEWallet,
  type KeplrEwalletInitArgs,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export function init(
  args: KeplrEwalletInitArgs,
): Result<CosmosEWalletInterface, string> {
  const eWalletRes = KeplrEWallet.init(args);
  if (!eWalletRes.success) {
    console.error(
      "[keplr-cosmos] ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return eWalletRes;
  }

  return { success: true, data: new (CosmosEWallet as any)(eWalletRes.data) };
}
