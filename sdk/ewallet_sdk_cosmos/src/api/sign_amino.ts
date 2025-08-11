import {
  serializeSignDoc,
  type AminoSignResponse,
  type StdSignDoc,
} from "@cosmjs/amino";
import { sha256 } from "@noble/hashes/sha2";
import type { KeplrSignOptions } from "@keplr-wallet/types";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

import { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import {
  encodeCosmosSignature,
  SignDocWrapper,
} from "@keplr-ewallet-sdk-cosmos/utils";

export async function signAmino(
  this: CosmosEWallet,
  chainId: string,
  signer: string,
  signDoc: StdSignDoc,
  signOptions?: KeplrSignOptions,
): Promise<AminoSignResponse> {
  try {
    const signDocHash = sha256(serializeSignDoc(signDoc));
    const publicKey = await this.getPublicKey();

    const origin = this.eWallet.origin;
    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    const signDocWrapper = SignDocWrapper.fromAminoSignDoc(signDoc);

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
        },
        msgs: signDocWrapper.aminoSignDoc.msgs,
        signer,
        signDocString: JSON.stringify(signDocWrapper.aminoSignDoc, null, 2),
        origin,
      },
    };

    const showModalResponse = await this.showModal(data);

    if (showModalResponse === "reject") {
      throw new Error("User rejected the signature request");
    }

    const signOutput = await this.makeSignature(signDocHash);

    const signature = encodeCosmosSignature(signOutput, publicKey);

    return {
      signed: signDoc,
      signature,
    };
  } catch (error) {
    console.error("[signAmino cosmos] [error] @@@@@", error);
    throw error;
  }
}
