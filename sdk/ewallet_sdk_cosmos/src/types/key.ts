import type { Key } from "@keplr-wallet/types";

export interface KeyData {
  chainId: string;
  key: Key | null;
}
