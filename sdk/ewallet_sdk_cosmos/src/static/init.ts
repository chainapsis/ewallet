import {
  KeplrEWallet,
  type KeplrEwalletInitArgs,
} from "@oko-wallet/ewallet-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import type { CosmosEWalletInterface } from "@oko-wallet-sdk-cosmos/types";
// import { CosmosEWallet } from "@oko-wallet-sdk-cosmos/cosmos_ewallet";
import type { CosmosEwalletInitError } from "@oko-wallet-sdk-cosmos/errors";
import { CosmosEWallet } from "@oko-wallet-sdk-cosmos/constructor";

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
