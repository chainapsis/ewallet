import type { KeplrSignOptions } from "@keplr-wallet/types";
import { type DirectSignResponse } from "@cosmjs/proto-signing";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

import type { SignDoc } from "@keplr-ewallet-sdk-cosmos/types/sign";
import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export async function signDirect(
  this: CosmosEWalletInterface,
  chainId: string,
  signer: string,
  signDoc: SignDoc,
  signOptions?: KeplrSignOptions,
): Promise<DirectSignResponse> {
  try {
    const origin = this.eWallet.origin;

    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    if (!chainInfo) {
      throw new Error("Chain info not found for chainId: " + chainId);
    }

    const data: MakeCosmosSigData = {
      chain_type: "cosmos",
      sign_type: "tx",
      payload: {
        chain_info: {
          chain_id: chainId,
          rpc_url: chainInfo.rpc,
          rest_url: chainInfo.rest,
          chain_name: chainInfo?.chainName ?? "",
          chain_symbol_image_url: chainInfo?.stakeCurrency?.coinImageUrl ?? "",
          fee_currencies: chainInfo.feeCurrencies,
          currencies: chainInfo.currencies,
          bech32_config: chainInfo?.bech32Config,
          features: chainInfo?.features,
          bip44: chainInfo?.bip44,
          evm: chainInfo?.evm,
        },
        signDoc,
        signer,
        origin,
        signOptions,
      },
    };

    const openModalResp = await this.openModal(data);

    switch (openModalResp.status) {
      case "approved": {
        return {
          signed: signDoc,
          signature: openModalResp.data.signature,
        };
      }
      case "rejected": {
        throw new Error("User rejected modal request");
      }
      case "error": {
        throw new Error(openModalResp.err);
      }
      default: {
        throw new Error("unreachable");
      }
    }
  } catch (error) {
    console.error("[keplr-cosmos] sign direct err: %s", error);

    throw error;
  }
}
