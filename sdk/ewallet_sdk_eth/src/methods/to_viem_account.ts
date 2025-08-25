import { type Address, type Hex, serializeTypedData } from "viem";

import type {
  EthEWalletInterface,
  EWalletAccount,
} from "@keplr-ewallet-sdk-eth/types";
import type { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import { toRpcTransactionRequest } from "@keplr-ewallet-sdk-eth/utils";

export async function toViemAccount(
  this: EthEWalletInterface,
): Promise<// TODO: @rowan
  // EWalletAccount<"ewallet", Hex>
  // Please write concretely
  any> {
  const publicKey = await this.getPublicKey();
  const address = await this.getAddress();

  const sign = this.makeSignature;

  const account: EWalletAccount<"ewallet", Address> = {
    address,
    type: "local",
    source: "ewallet",
    publicKey,
    signMessage: async ({ message }) => {
      const { signature } = await sign({
        type: "personal_sign",
        data: {
          address,
          message,
        },
      });

      return signature;
    },
    signTransaction: async (transaction) => {
      const { signedTransaction } = await sign({
        type: "sign_transaction",
        data: {
          address,
          transaction: toRpcTransactionRequest(transaction),
        },
      });

      return signedTransaction;
    },
    signTypedData: async (typedData) => {
      const { signature } = await sign({
        type: "sign_typedData_v4",
        data: {
          address,
          serializedTypedData: serializeTypedData(typedData),
        },
      });

      return signature;
    },
  };

  return account satisfies EWalletAccount<"ewallet", Address>;
}
