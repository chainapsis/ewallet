import { KeplrEWallet } from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";

import { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import type { EthEWalletInitArgs } from "@keplr-ewallet-sdk-eth/types";

export function initEthEWallet(
  args: EthEWalletInitArgs,
): Result<EthEWallet, string> {
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
    data: new EthEWallet(eWalletRes.data, args.use_testnet),
  };
}

export async function initEthEWalletAsync(
  args: EthEWalletInitArgs,
): Promise<Result<EthEWallet, string>> {
  const eWalletRes = KeplrEWallet.init(args);

  if (!eWalletRes.success) {
    console.error(
      "[keplr] eth, ewallet core init fail, err: %s",
      eWalletRes.err,
    );

    return eWalletRes;
  }

  const ethEWallet = new EthEWallet(eWalletRes.data, args.use_testnet);

  await ethEWallet.waitUntilInitialized();

  return {
    success: true,
    data: ethEWallet,
  };
}
