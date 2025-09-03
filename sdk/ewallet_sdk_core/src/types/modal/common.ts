import type { Hex, RpcTransactionRequest, SignableMessage } from "viem";
import type { StdSignDoc, StdSignature } from "@cosmjs/amino";
import type {
  Bech32Config,
  ChainInfo,
  KeplrSignOptions,
} from "@keplr-wallet/types";

import type { SignDoc } from "@keplr-ewallet-sdk-core/types/cosmos_sign";

export type ChainInfoForAttachedModal = {
  readonly chain_id: string;
  readonly chain_name: string;
  readonly chain_symbol_image_url?: string;
  readonly rpc_url: string;
  // NOTE: Currently, this type is being used in Ethereum's makeSignature function,
  // so if rest_url need to be none nullable, should check the compatibility of make_signature func of eth_sdk
  readonly rest_url?: string;
  readonly block_explorer_url?: string;
  readonly fee_currencies?: ChainInfo["feeCurrencies"];
  readonly currencies?: ChainInfo["currencies"];
  readonly bech32_config?: Bech32Config;

  readonly bip44?: ChainInfo["bip44"];
  readonly features?: ChainInfo["features"];
  readonly evm?: ChainInfo["evm"];
};
