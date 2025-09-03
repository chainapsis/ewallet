import type { StdSignature } from "@cosmjs/amino";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import { makeADR36AminoSignDoc } from "@keplr-ewallet-sdk-cosmos/utils/arbitrary";

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

    if (!chainInfo) {
      throw new Error("Chain info not found for chainId: " + chainId);
    }

    const msg: MakeCosmosSigData = {
      chain_type: "cosmos",
      sign_type: "arbitrary",
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
        signer,
        data,
        signDoc,
        origin,
      },
    };

    const openModalResp = await this.openModal(msg);

    switch (openModalResp.status) {
      case "approved": {
        const signature = openModalResp.data.signature;

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

    // if (openModalResponse.approved === false) {
    //   throw new Error("User rejected the signature request");
    // }
    //
    // const signature = openModalResponse.data.signature;
    // const isVerified = await this.verifyArbitrary(
    //   chainId,
    //   signer,
    //   data,
    //   signature,
    // );
    //
    // if (!isVerified) {
    //   throw new Error("Signature verification failed");
    // }
    //
    // return {
    //   ...signature,
    // };
  } catch (error) {
    console.error("[keplr-cosmos] Error signing arbitrary, err: %s", error);

    throw error;
  }
}
