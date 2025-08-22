import type { KeplrSignOptions } from "@keplr-wallet/types";
import { type DirectSignResponse } from "@cosmjs/proto-signing";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { SignDoc } from "@keplr-ewallet-sdk-cosmos/types/sign";

export async function signDirect(
  this: CosmosEWallet,
  chainId: string,
  signer: string,
  signDoc: SignDoc,
  signOptions?: KeplrSignOptions,
): Promise<DirectSignResponse> {
  try {
    const origin = this.eWallet.origin;

    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    const showModalData: MakeCosmosSigData = {
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
        },
        signDoc,
        signer,
        origin,
      },
    };
    const showModalResponse = await this.showModal(showModalData);

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
    console.error("[signDirect cosmos] [error] @@@@@", error);
    throw error;
  }
}
