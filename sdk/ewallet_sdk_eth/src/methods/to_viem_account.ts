import { serializeTypedData } from "viem";

import type {
  EthEWalletInterface,
  EWalletAccount,
} from "@keplr-ewallet-sdk-eth/types";
import { toRpcTransactionRequest } from "@keplr-ewallet-sdk-eth/utils";

export async function toViemAccount(
  this: EthEWalletInterface,
): Promise<EWalletAccount> {
  const publicKey = await this.getPublicKey();
  const address = await this.getAddress();

  const sign = this.makeSignature;

  const account: EWalletAccount = {
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

  return account;
}
