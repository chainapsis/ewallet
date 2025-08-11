import React from "react";
import type {
  ChainInfoForAttachedModal,
  CosmosTxSignPayload,
} from "@keplr-ewallet/ewallet-sdk-core";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";

import "./cosmos_tx_signature_content.scss";
import { MetadataContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/metadata_content/metadata_content";
import { Typography } from "@keplr-ewallet-common-ui/typography/typography";
import { type StdSignDoc } from "@cosmjs/amino";
import type { Coin } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

interface CosmosTxSignatureContentProps {
  payload: CosmosTxSignPayload;
}

const getFee = (
  signDocJson: any,
  chainInfo: ChainInfoForAttachedModal,
): string => {
  const isDirectSignDoc = "auth_info" in signDocJson;

  //TODO "@keplr-ewallet-sdk-cosmos/utils의 SignDocWrapper에서 authInfo 정보가 signDoc에 포함되게 오게 구현될 경우 그 다음 구현 @retto
  if (isDirectSignDoc) {
    return "not implemented";
  }

  const fee = (() => {
    if (isDirectSignDoc) {
      const signDoc = signDocJson as {
        auth_info: {
          fee: {
            amount: {
              denom: string;
              amount: string;
            }[];
          };
        };
      };
      return signDoc.auth_info.fee.amount;
    }

    const signDoc = signDocJson as StdSignDoc;
    return signDoc.fee.amount;
  })();

  const feeCurrency = getFeeString(fee[0], chainInfo);
  return feeCurrency;
};
const getFeeString = (fee: Coin, chainInfo: ChainInfoForAttachedModal) => {
  const feeCurrency =
    chainInfo?.fee_currencies?.find((c) => c.coinMinimalDenom === fee.denom) ??
    chainInfo?.currencies?.find((c) => c.coinMinimalDenom === fee.denom);

  if (!feeCurrency) {
    return "can't get fee";
  }

  const feePretty = new CoinPretty(feeCurrency, new Dec(fee.amount));

  return feePretty.maxDecimals(6).toString();
};

export const CosmosTxSignatureContent: React.FC<
  CosmosTxSignatureContentProps
> = ({ payload }) => {
  const signDocJson = JSON.parse(payload.signDocString);
  const feeString = getFee(signDocJson, payload.chain_info);

  return (
    <div className="container">
      <MetadataContent
        origin={payload.origin}
        chainInfo={payload.chain_info}
        signer={payload.signer}
      />
      <Spacing height={28} />
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <pre>{payload.signDocString}</pre>
      </div>
      <Spacing height={28} />
      <div className="feeContainer">
        <Typography color="tertiary" size="sm" weight="semibold">
          Fee
        </Typography>
        <Typography color="tertiary" size="sm" weight="regular">
          {feeString}
        </Typography>
      </div>
    </div>
  );
};
