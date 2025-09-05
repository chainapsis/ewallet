import type { StdSignature } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import { verifyADR36Amino } from "@keplr-ewallet-sdk-cosmos/utils/arbitrary";

export async function verifyArbitrary(
  this: CosmosEWalletInterface,
  chainId: string,
  signer: string,
  data: string | Uint8Array,
  signature: StdSignature,
): Promise<boolean> {
  try {
    // Get chain info to determine the bech32 prefix
    const chainInfoList = await this.getCosmosChainInfo();
    const chainInfo = chainInfoList.find((info) => info.chainId === chainId);

    if (!chainInfo || !chainInfo.bech32Config?.bech32PrefixAccAddr) {
      throw new Error(`Chain info not found for chainId: ${chainId}`);
    }

    const bech32PrefixAccAddr = chainInfo.bech32Config.bech32PrefixAccAddr;

    // Convert signature from base64 to Uint8Array
    if (signature.signature === undefined) {
      throw new Error('STDSignature not contains "signature" property');
    }
    const signatureBytes = fromBase64(signature.signature);

    // Get public key from signature.pub_key
    let pubKeyBytes: Uint8Array;
    if (signature.pub_key?.value) {
      pubKeyBytes = fromBase64(signature.pub_key.value);
    } else {
      throw new Error("Public key not found in signature");
    }

    // Determine algorithm based on signature type
    const algo =
      signature.pub_key?.type === "ethsecp256k1/PubKey"
        ? "ethsecp256k1"
        : "secp256k1";

    return verifyADR36Amino(
      bech32PrefixAccAddr,
      signer,
      data,
      pubKeyBytes,
      signatureBytes,
      algo,
    );
  } catch (error) {
    console.error("Error verifying arbitrary signature:", error);
    return false;
  }
}
