import React from "react";
import type { EthereumTxSignPayload } from "@keplr-ewallet/ewallet-sdk-core";

import styles from "./ethereum_tx_description.module.scss";
import { useEthereumHumanReadableTx } from "@keplr-ewallet-attached/hooks/ethereum/use-ethereum-human-readable-tx";
import { Skeleton } from "@keplr-ewallet-attached/components/skeleton/skeleton";

export interface EthereumTxDescriptionProps {
  payload: EthereumTxSignPayload;
}

export const EthereumTxDescription: React.FC<EthereumTxDescriptionProps> = ({
  payload,
}) => {
  const { description, isLoading, errors } =
    useEthereumHumanReadableTx(payload);

  if (isLoading)
    return (
      <Skeleton width="100%" height="20px" className="skeleton--text-sm" />
    );
  // TODO: handle error message
  if (errors.length > 0) return <pre>...</pre>;
  return <pre className={styles.description}>{description}</pre>;
};
