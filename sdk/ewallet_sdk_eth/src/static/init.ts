import { KeplrEWallet } from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import type {
  EthEWalletInitArgs,
  EthEWalletInterface,
} from "@keplr-ewallet-sdk-eth/types";

export function init(
  args: EthEWalletInitArgs,
): Result<EthEWalletInterface, string> {
  const eWalletRes = KeplrEWallet.init(args);

  if (!eWalletRes.success) {
    console.error(
      "[keplr] eth, ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return eWalletRes;
  }

  return {
    success: true,
    data: new (EthEWallet as any)(eWalletRes.data, args.use_testnet),
  };
}
