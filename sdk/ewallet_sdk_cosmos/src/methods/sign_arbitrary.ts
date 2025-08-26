import type { StdSignature } from "@cosmjs/amino";

import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import { makeADR36AminoSignDoc } from "@keplr-ewallet-sdk-cosmos/utils/arbitrary";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

export async function signArbitrary(
  this: CosmosEWalletInterface,
  chainId: string,
  signer: string,
  data: string | Uint8Array,
): Promise<StdSignature> {
  try {
    // Create ADR-36 sign doc for arbitrary message signing
    const signDoc = makeADR36AminoSignDoc(signer, data);
    const origin = this.eWallet.origin;

    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    const showModalMsg: MakeCosmosSigData = {
      chain_type: "cosmos",
      sign_type: "arbitrary",
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
        signer,
        data,
        signDoc,
        origin,
      },
    };
    const showModalResponse = await this.showModal(showModalMsg);

    if (showModalResponse.approved === false) {
      throw new Error("User rejected the signature request");
    }

    const signature = showModalResponse.data.signature;
    const isVerified = await this.verifyArbitrary(
      chainId,
      signer,
      data,
      signature,
    );

    if (!isVerified) {
      throw new Error("Signature verification failed");
    }

    return {
      ...signature,
    };
  } catch (error) {
    console.error("[signArbitrary cosmos] [error] @@@@@", error);
    throw error;
  }
}
