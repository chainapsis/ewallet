import type {
  MakeCosmosSigData,
  MakeEthereumSigData,
} from "@keplr-ewallet/ewallet-sdk-core";
import React from "react";

import { CosmosTxSignatureContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/content/cosmos_tx_signature/cosmos_tx_signature_content";
import { CosmosArbitrarySignatureContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/content/cosmos_arbitrary_signature/cosmos_arbitrary_signature_content";
import { EthereumTxSignatureContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/content/ethereum_tx_signature/ethereum_tx_signature_content";
import { EthereumArbitrarySignatureContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/content/ethereum_arbitrary_signature/ethereum_arbitrary_signature_content";
import { EthereumEip712SignatureContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/content/ethereum_eip712_signature/ethereum_eip712_signature_content";

export const MakeSignatureModalContent: React.FC<{
  data: MakeCosmosSigData | MakeEthereumSigData;
}> = ({ data }) => {
  const { chain_type, sign_type } = data;

  const content = (() => {
    if (chain_type === "cosmos" && sign_type === "tx") {
      return <CosmosTxSignatureContent payload={data.payload} />;
    }
    if (chain_type === "cosmos" && sign_type === "arbitrary") {
      return <CosmosArbitrarySignatureContent payload={data.payload} />;
    }
    if (chain_type === "eth" && sign_type === "tx") {
      return <EthereumTxSignatureContent payload={data.payload} />;
    }
    if (chain_type === "eth" && sign_type === "arbitrary") {
      return <EthereumArbitrarySignatureContent payload={data.payload} />;
    }
    if (chain_type === "eth" && sign_type === "eip712") {
      return <EthereumEip712SignatureContent payload={data.payload} />;
    }
    return null;
  })();

  return content;
};
