import React, { useEffect } from "react";
import type { EthereumTxSignPayload } from "@keplr-ewallet/ewallet-sdk-core";
import { formatEther } from "viem";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";
import { Typography } from "@keplr-ewallet-common-ui/typography/typography";

import "./ethereum_tx_signature_content.scss";
import { MetadataContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/metadata_content/metadata_content";
import { useEthereumTxSimulation } from "@keplr-ewallet-attached/hooks/ethereum/use-ethereum-tx-simulation";
import { useEthereumTxSimulationStatus } from "@keplr-ewallet-attached/hooks/ethereum/use-ethereum-tx-simulation-status";
import { Skeleton } from "@keplr-ewallet-attached/components/skeleton/skeleton";
import { EthereumTxDescription } from "./ethereum_tx_description";

interface EthereumTxSignatureContentProps {
  payload: EthereumTxSignPayload;
}

export const EthereumTxSignatureContent: React.FC<
  EthereumTxSignatureContentProps
> = ({ payload }) => {
  const { queries, clearSimulation } = useEthereumTxSimulation(payload);
  const { isSimulating, errors, hasAttempted } =
    useEthereumTxSimulationStatus(payload);

  const estimatedFee = (() => {
    if (!queries.feeData.data || !queries.gasEstimation.data) {
      return "...";
    }

    const gasLimit = queries.gasEstimation.data;
    let totalFee = 0n;

    if (queries.feeData.data.type === "eip1559") {
      totalFee = gasLimit * queries.feeData.data.maxFeePerGas!;
    } else {
      totalFee = gasLimit * queries.feeData.data.gasPrice!;
    }

    // add l1 fee if result exists
    if (queries.l1GasEstimation.data) {
      totalFee += queries.l1GasEstimation.data.l1Fee;
    }

    return `${formatEther(totalFee)} ETH`;
  })();

  useEffect(() => {
    return () => {
      clearSimulation();
    };
  }, []);

  return (
    <div className="container">
      <MetadataContent
        origin={payload.origin}
        chainInfo={payload.chain_info}
        signer={payload.signer}
      />
      <Spacing height={28} />
      <Typography color="tertiary" size="sm" weight="semibold">
        Transaction Summary
      </Typography>
      <Spacing height={8} />
      <div className="txRequestContainer">
        <EthereumTxDescription payload={payload} />
      </div>
      <Spacing height={28} />

      <div className="feeContainer">
        <Typography color="tertiary" size="sm" weight="semibold">
          Fee
        </Typography>
        {isSimulating || !hasAttempted ? (
          <Skeleton width="100px" height="16px" className="skeleton--text-sm" />
        ) : (
          <Typography color="tertiary" size="sm" weight="regular">
            {estimatedFee}
          </Typography>
        )}
      </div>
    </div>
  );
};
