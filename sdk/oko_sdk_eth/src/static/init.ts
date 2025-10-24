import { KeplrEWallet } from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  EthEWalletInterface,
  EthEWalletInitArgs,
} from "@oko-wallet-sdk-eth/types";
import type { EthEwalletInitError } from "@oko-wallet-sdk-eth/errors";
import { EthEWallet } from "@oko-wallet-sdk-eth/constructor";

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
    data: new (EthEWallet as any)(eWalletRes.data),
  };
}
