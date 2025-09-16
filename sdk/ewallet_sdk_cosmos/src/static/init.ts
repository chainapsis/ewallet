import {
  KeplrEWallet,
  type KeplrEwalletInitArgs,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
// import { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { CosmosEwalletInitError } from "@keplr-ewallet-sdk-cosmos/errors";
import { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/constructor";

export function init(
  args: KeplrEwalletInitArgs,
): Result<CosmosEWalletInterface, CosmosEwalletInitError> {
  const eWalletRes = KeplrEWallet.init(args);
  if (!eWalletRes.success) {
    console.error(
      "[keplr-cosmos] ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return {
      success: false,
      err: { type: "ewallet_core_init_fail", msg: eWalletRes.err.toString() },
    };
  }

  return { success: true, data: new (CosmosEWallet as any)(eWalletRes.data) };
}

// export async function initAsync(
//   args: KeplrEwalletInitArgs,
// ): Promise<Result<CosmosEWalletInterface, string>> {
//   const eWalletRes = KeplrEWallet.init(args);
//   if (!eWalletRes.success) {
//     console.error(
//       "[keplr-cosmos] ewallet core init fail, err: %s",
//       eWalletRes.err,
//     );
//
//     return { success: false, err: eWalletRes.err.toString() };
//   }
//
//   const eWallet: CosmosEWalletInterface = new (CosmosEWallet as any)(
//     eWalletRes.data,
//   );
//
//   await eWallet.waitUntilInitialized;
//
//   return { success: true, data: eWallet };
// }
