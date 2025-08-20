import { sha256 } from "@noble/hashes/sha2";
import type { StdSignature } from "@cosmjs/amino";
import { serializeSignDoc } from "@cosmjs/amino";

import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import { encodeCosmosSignature } from "@keplr-ewallet-sdk-cosmos/utils/sign";
import { makeADR36AminoSignDoc } from "@keplr-ewallet-sdk-cosmos/utils/arbitrary";
import type { MakeCosmosSigData } from "@keplr-ewallet/ewallet-sdk-core";

export async function signArbitrary(
  this: CosmosEWallet,
  chainId: string,
  signer: string,
  data: string | Uint8Array,
): Promise<StdSignature> {
  try {
    // Create ADR-36 sign doc for arbitrary message signing
    const signDoc = makeADR36AminoSignDoc(signer, data);
    const publicKey = await this.getPublicKey();
    const signDocHash = sha256(serializeSignDoc(signDoc));
    const origin = this.eWallet.origin;

    const chainInfoList = await this.eWallet.getCosmosChainInfo(chainId);
    const chainInfo = chainInfoList[0];

    const showModalMsg: MakeCosmosSigData = {
      chain_type: "cosmos",
      sign_type: "arbitrary",
      payload: {
        chain_info: {
          chain_id: chainId,
          chain_name: chainInfo?.chainName ?? "",
          chain_symbol_image_url: chainInfo?.stakeCurrency?.coinImageUrl ?? "",
        },
        signer,
        data,
        signDoc,
        origin,
      },
    };
    const showModalResponse = await this.showModal(showModalMsg);

    if (showModalResponse === "reject") {
      throw new Error("User rejected the signature request");
    }

    const signOutput = await this.makeSignature(signDocHash);

    const signature = encodeCosmosSignature(signOutput, publicKey);

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
