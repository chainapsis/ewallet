import type {
  Address,
  Hex,
  SignableMessage,
  RpcTransactionRequest,
} from "viem";

export type EthSignParams =
  | {
      type: "sign_transaction";
      data: {
        address: Address;
        transaction: RpcTransactionRequest;
      };
    }
  | {
      type: "personal_sign";
      data: {
        address: Address;
        message: SignableMessage;
      };
    }
  | {
      type: "sign_typedData_v4";
      data: {
        address: Address;
        serializedTypedData: string;
      };
    };

export type EthSignResult =
  | {
      type: "signed_transaction";
      signedTransaction: Hex;
    }
  | {
      type: "signature";
      signature: Hex;
    };

/**
 * Signer interface for Ethereum
 */
export interface EthSigner {
  getAddress: () => Address | null;
  sign: (params: EthSignParams) => Promise<EthSignResult>;
}
