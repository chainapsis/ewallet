import React from "react";
import type { EthereumArbitrarySignPayload } from "@keplr-ewallet/ewallet-sdk-core";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";
import { Typography } from "@keplr-ewallet-common-ui/typography/typography";
import { bytesToString, hexToString } from "viem";

import "./ethereum_arbitrary_signature_content.scss";
import { MetadataContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/metadata_content/metadata_content";

interface EthereumArbitrarySignatureContentProps {
  payload: EthereumArbitrarySignPayload;
}

export const EthereumArbitrarySignatureContent: React.FC<
  EthereumArbitrarySignatureContentProps
> = ({ payload }) => {
  const message = (() => {
    const message = payload.data.message;
    if (typeof message === "string") {
      if (message.startsWith("0x")) {
        return hexToString(message as `0x${string}`);
      }

      return message;
    }

    const rawMessage = message.raw;
    if (typeof rawMessage === "string") {
      return hexToString(rawMessage);
    }

    return bytesToString(rawMessage);
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
        Message
      </Typography>
      <Spacing height={8} />
      <div className="messageContainer">
        <p className="message">{message}</p>
      </div>
    </div>
  );
};
