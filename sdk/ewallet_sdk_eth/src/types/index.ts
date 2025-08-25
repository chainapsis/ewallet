export * from "./eth_ewallet";
export * from "./sign";

import type { Address, CustomSource, Hex, Prettify } from "viem";

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
