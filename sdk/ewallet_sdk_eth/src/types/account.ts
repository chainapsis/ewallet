import type { Address, CustomSource, Hex } from "viem";

/**
 * Ewallet account type
 * This is a viem compatible account type
 * Referenced from viem's `LocalAccount` type for shape compatibility
 *
 * See viem `LocalAccount` definition:
 * - [LocalAccount type](https://github.com/wevm/viem/blob/cbfa2e0969224e97886339cbe060903e51680e90/src/accounts/types.ts#L74)
 */
export type EWalletAccount = CustomSource & {
  address: Address;
  publicKey: Hex;
  source: "ewallet";
  type: "local";
};
