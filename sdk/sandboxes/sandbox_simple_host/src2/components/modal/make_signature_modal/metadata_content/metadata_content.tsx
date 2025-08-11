import React from "react";
import type { ChainInfoForAttachedModal } from "@keplr-ewallet/ewallet-sdk-core";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";
import { Typography } from "@keplr-ewallet/ewallet-common-ui/typography";

import styles from "./metadata_content.module.scss";

function getFaviconUrl(origin: string): string {
  try {
    const { hostname } = new URL(origin);
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  } catch (error) {
    return "";
  }
}

interface MakeSignatureModalMetadataContentProps {
  origin: string;
  chainInfo: ChainInfoForAttachedModal;
  signer: string;
}

export const MetadataContent: React.FC<
  MakeSignatureModalMetadataContentProps
> = ({ origin, chainInfo, signer }) => {
  const faviconUrl = getFaviconUrl(origin);

  return (
    <div className={styles.container}>
      <div className={styles.originRow}>
        {faviconUrl && faviconUrl.length > 0 && (
          <img
            src={faviconUrl}
            alt="favicon"
            className={styles.originFavicon}
          />
        )}
        <Typography size="xs" color="tertiary" weight="medium">
          {origin}
        </Typography>
      </div>

      <Spacing height={12} />

      <div className={styles.signInfoColumn}>
        <div className={styles.chainInfoRow}>
          <Typography size="xs" color="secondary" weight="medium">
            on {chainInfo.chain_name}
          </Typography>
          <img
            src={chainInfo.chain_symbol_image_url}
            alt="chain icon"
            className={styles.chainIcon}
          />
        </div>
        <Typography size="xs" color="secondary" weight="medium">
          with {signer}
        </Typography>
      </div>
    </div>
  );
};
