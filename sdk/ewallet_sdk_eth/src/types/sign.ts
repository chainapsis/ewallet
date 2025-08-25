import type { KeplrEwalletInitArgs } from "@keplr-ewallet/ewallet-sdk-core";
import type {
  Address,
  CustomSource,
  Hex,
  Prettify,
  SignableMessage,
  RpcTransactionRequest,
} from "viem";

export type EthSignParams2 =
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

export type EthSignResult2 =
  | {
    param_type: "sign_transaction";
    type: "signed_transaction";
    signedTransaction: Hex;
  }
  | {
    param_type: "personal_sign";
    type: "signature";
    signature: Hex;
  }
  | {
    param_type: "sign_typedData_v4";
    type: "signature";
    signature: Hex;
  };

export interface EthSignMethodMap {
  sign_transaction: {
    params: {
      type: "sign_transaction";
      data: {
        address: Address;
        transaction: RpcTransactionRequest;
      };
    };
    result: { type: "signed_transaction"; signedTransaction: Hex };
  };
  personal_sign: {
    params: {
      type: "personal_sign";
      data: {
        address: Address;
        message: SignableMessage;
      };
    };
    result: { type: "signature"; signature: Hex };
  };
  sign_typedData_v4: {
    params: {
      type: "sign_typedData_v4";
      data: {
        address: Address;
        serializedTypedData: string;
      };
    };
    result: { type: "signature"; signature: Hex };
  };
}

export type EthSignMethod = keyof EthSignMethodMap;
export type EthSignParams = EthSignMethodMap[EthSignMethod]["params"];
export type EthSignResult<P extends EthSignParams> =
  EthSignMethodMap[P["type"]]["result"];

/**
 * Sign function
 * @param parameters - Sign function parameters
 * @returns Sign function result
 */
export type EthSignFunction = <P extends EthSignParams>(
  parameters: P,
) => Promise<EthSignResult<P>>;

/**
 * Signer interface for Ethereum
 */
export interface EthSigner {
  getAddress: () => Address | null;
  sign: EthSignFunction;
}
