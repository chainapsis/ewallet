import React, { useState } from "react";
import type { CosmosArbitrarySignPayload } from "@keplr-ewallet/ewallet-sdk-core";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";
import { Typography } from "@keplr-ewallet-common-ui/typography/typography";

import { MetadataContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/metadata_content/metadata_content";
import styles from "./cosmos_arbitrary_signature_content.module.scss";

interface CosmosArbitrarySignatureContentProps {
  payload: CosmosArbitrarySignPayload;
}

export const CosmosArbitrarySignatureContent: React.FC<
  CosmosArbitrarySignatureContentProps
> = ({ payload }) => {
  const [isViewRawData, setIsViewRawData] = useState(false);

  return (
    <div className="container">
      <MetadataContent
        origin={payload.origin}
        chainInfo={payload.chain_info}
        signer={payload.signer}
      />

      <Spacing height={28} />

      <Typography size="sm" color="tertiary" weight="semibold">
        Message
      </Typography>

      <Spacing height={8} />

      <div className={styles.dataContainer}>
        <div
          onClick={() => setIsViewRawData(!isViewRawData)}
          style={{
            cursor: "pointer",
          }}
        >
          <Typography size="xs" color="tertiary" weight="medium">
            View Data
          </Typography>
        </div>
        {isViewRawData ? (
          <div className={styles.rawData}>
            <pre>{JSON.stringify(payload.signDoc, null, 2)}</pre>
          </div>
        ) : (
          <Typography size="md" color="tertiary" weight="medium">
            {payload.data}
          </Typography>
        )}
      </div>
    </div>
  );
};
