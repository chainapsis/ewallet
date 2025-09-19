import type {
  AppCurrency,
  Bech32Config,
  BIP44,
  EVMInfo,
  FeeCurrency,
} from "@keplr-wallet/types";

export type ChainInfoForAttachedModal = {
  readonly chain_id: string;
  readonly chain_name: string;
  readonly chain_symbol_image_url?: string;
  readonly rpc_url: string;
  // NOTE: Currently, this type is being used in Ethereum's makeSignature
  // function, so if rest_url need to be none nullable, should check the
  // compatibility of make_signature func of eth_sdk
  readonly rest_url?: string;
  readonly block_explorer_url?: string;
  readonly fee_currencies?: FeeCurrency[];
  readonly currencies?: AppCurrency[];
  readonly bech32_config?: Bech32Config;

  readonly bip44?: BIP44;
  readonly features?: string[];
  readonly evm?: EVMInfo;
};
