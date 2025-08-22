import {
  initKeplrEwalletCore,
  type KeplrEwalletInitArgs,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";

export async function initEthEWallet(
  args: KeplrEwalletInitArgs & { use_testnet?: boolean },
): Promise<Result<EthEWallet, string>> {
  const eWalletRes = await initKeplrEwalletCore(args);

  if (!eWalletRes.success) {
    console.error(
      "[keplr] eth, ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return eWalletRes;
  }

  return {
    success: true,
    data: new EthEWallet(eWalletRes.data, args.use_testnet),
  };
}
