import React from "react";
import type { EthereumEip712SignPayload } from "@keplr-ewallet/ewallet-sdk-core";
import { parseTypedDataDefinition } from "@keplr-ewallet/ewallet-sdk-eth";
import { stringify } from "viem";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";
import { Typography } from "@keplr-ewallet-common-ui/typography/typography";

import "./ethereum_eip712_signature_content.scss";
import { MetadataContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/metadata_content/metadata_content";

interface EthereumEip712SignatureContentProps {
  payload: EthereumEip712SignPayload;
}

export const EthereumEip712SignatureContent: React.FC<
  EthereumEip712SignatureContentProps
> = ({ payload }) => {
  const typedData = (() => {
    const serializedTypedData = payload.data.serialized_typed_data;
    return parseTypedDataDefinition(serializedTypedData);
  })();

  return (
    <div className="container">
      <MetadataContent
        origin={payload.origin}
        chainInfo={payload.chain_info}
        signer={payload.signer}
      />
      <Spacing height={28} />
      <Typography color="tertiary" size="sm" weight="semibold">
        EIP-712 Typed Data
      </Typography>
      <Spacing height={8} />
      <div className="typedDataContainer">
        <pre className="typedDataSummary">{stringify(typedData, null, 2)}</pre>
      </div>
    </div>
  );
};
