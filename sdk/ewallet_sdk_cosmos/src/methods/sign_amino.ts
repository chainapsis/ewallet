import {
  serializeSignDoc,
  type AminoSignResponse,
  type StdSignDoc,
} from "@cosmjs/amino";
import { sha256 } from "@noble/hashes/sha2";
import type { KeplrSignOptions } from "@keplr-wallet/types";

import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

export async function signAmino(
  this: CosmosEWallet,
  chainId: string,
  signer: string,
  signDoc: StdSignDoc,
  signOptions?: KeplrSignOptions,
): Promise<AminoSignResponse> {
  try {
    const origin = this.eWallet.origin;
    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    const data: MakeCosmosSigData = {
      chain_type: "cosmos",
      sign_type: "tx",
      payload: {
        chain_info: {
          chain_id: chainId,
          chain_name: chainInfo?.chainName ?? "",
          chain_symbol_image_url: chainInfo?.stakeCurrency?.coinImageUrl ?? "",
          fee_currencies: chainInfo?.feeCurrencies,
          currencies: chainInfo?.currencies,

          bech32_config: chainInfo?.bech32Config,
          features: chainInfo?.features,
          bip44: chainInfo?.bip44,
          evm: chainInfo?.evm,
        },
        signDoc,
        signer,
        origin,
      },
    };

    const showModalResponse = await this.showModal(data);

    if (showModalResponse.approved === false) {
      throw new Error(
        showModalResponse.reason ?? "User rejected the signature request",
      );
    }

    return {
      signed: signDoc,
      signature: showModalResponse.data.signature,
    };
  } catch (error) {
    console.error("[signAmino cosmos] [error] @@@@@", error);
    throw error;
  }
}
