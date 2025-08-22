import type {
  Address,
  CustomSource,
  Hex,
  Prettify,
  SignableMessage,
  RpcTransactionRequest,
} from "viem";

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

/**
 * Ewallet account type
 * This is a viem compatible account type
 */
export type EWalletAccount<
  source extends string = string,
  address extends Address = Address,
> = Prettify<
  CustomSource & {
    address: address;
    publicKey: Hex;
    source: source;
    type: "local";
  }
>;

// export interface IEthEWallet {
//   type: "ethereum";
//   chainId: string; // CAIP-2 formatting
//   address: Hex;
//   /**
//    * @returns EIP-1193 compatible Ethereum provider
//    */
//   getEthereumProvider: () => Promise<EIP1193Provider>;
//   /**
//    * Execute `personal_sign` operation with user wallet
//    *
//    * @param msg - Message to sign in hex format
//    * @returns Signature of the message in hex format
//    */
//   sign: (msg: string) => Promise<Hex>;
//   /**
//    * Switch to the specified chain
//    * The chain must be supported by the wallet
//    *
//    * @param chainId - Chain ID to switch to in hex string or number
//    */
//   switchChain: (chainId: `0x${string}` | number) => Promise<void>;
// }
