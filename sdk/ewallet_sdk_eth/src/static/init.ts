import { KeplrEWallet } from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import type {
  EthEWalletInitArgs,
  EthEWalletInterface,
} from "@keplr-ewallet-sdk-eth/types";
import type { EthEwalletInitError } from "@keplr-ewallet-sdk-eth/errors";
import { EthEWallet } from "@keplr-ewallet-sdk-eth/constructor";

export function init(
  args: EthEWalletInitArgs,
): Result<EthEWalletInterface, EthEwalletInitError> {
  const eWalletRes = KeplrEWallet.init(args);

  if (!eWalletRes.success) {
    console.error(
      "[keplr-eth] ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return {
      success: false,
      err: { type: "ewallet_core_init_fail", msg: eWalletRes.err.toString() },
    };
  }

  return {
    success: true,
    data: new (EthEWallet as any)(eWalletRes.data, args.use_testnet),
  };
}

// export async function initAsync(
//   args: EthEWalletInitArgs,
// ): Promise<Result<EthEWalletInterface, EthEwalletInitError>> {
//   const eWalletRes = KeplrEWallet.init(args);
//
//   if (!eWalletRes.success) {
//     console.error(
//       "[keplr-eth] ewallet core init fail, err: %s",
//       eWalletRes.err,
//     );
//
//     return {
//       success: false,
//       err: { type: "ewallet_core_init_fail", msg: eWalletRes.err.toString() },
//     };
//   }
//
//   const eWallet: EthEWalletInterface = new (EthEWallet as any)(
//     eWalletRes.data,
//     args.use_testnet,
//   );
//   await eWallet.waitUntilInitialized;
//
//   return {
//     success: true,
//     data: eWallet,
//   };
// }
