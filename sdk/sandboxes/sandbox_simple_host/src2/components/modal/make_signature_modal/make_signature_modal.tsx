import React from "react";
import { XCloseIcon } from "@keplr-ewallet/ewallet-common-ui/icons/x_close";
import { Button } from "@keplr-ewallet/ewallet-common-ui/button";
import { LogoIcon } from "@keplr-ewallet/ewallet-common-ui/icons/logo_icon";
import { LogoTextIcon } from "@keplr-ewallet/ewallet-common-ui/icons/logo_text_icon";
import { Spacing } from "@keplr-ewallet/ewallet-common-ui/spacing";
import type {
  EthereumTxSignResult,
  MakeSignatureModalPayload,
  MakeSignatureModalResult,
} from "@keplr-ewallet/ewallet-sdk-core";

import styles from "./make_signature_modal.module.scss";
import { CommonModal } from "@keplr-ewallet-attached/components/modal/common_modal/common_modal";
import type { HideModalFn } from "@keplr-ewallet-attached/components/modal/types";
import { MakeSignatureModalContent } from "@keplr-ewallet-attached/components/modal/make_signature_modal/content";
import { useEthereumTxSimulationStatus } from "@keplr-ewallet-attached/hooks/ethereum/use-ethereum-tx-simulation-status";
import { getHostOriginFromPayload } from "@keplr-ewallet-attached/utils/origin";
import { Typography } from "@keplr-ewallet-common-ui/typography/typography";

export const MakeSignatureModal: React.FC<MakeSignatureModalProps> = ({
  payload,
  hideModal,
}) => {
  const hostOrigin = getHostOriginFromPayload(payload);

  const {
    isSimulating,
    isFeeSufficient,
    hasErrors,
    hasAttempted,
    getSimulatedTransaction,
  } = useEthereumTxSimulationStatus(payload);

  const isDemo =
    !!hostOrigin && hostOrigin === import.meta.env.VITE_DEMO_WEB_ORIGIN;

  const isApproveButtonDisabled =
    isSimulating || hasErrors || !hasAttempted || !isFeeSufficient;

  const onReject = () => hideModal({ result: "reject" });
  const onApprove = () => {
    let data: MakeSignatureModalResult | undefined;

    if (payload.data.chain_type === "eth" && payload.data.sign_type === "tx") {
      const simulatedTransaction = getSimulatedTransaction(
        payload.data.payload.data.transaction,
      );

      if (!simulatedTransaction) {
        throw new Error("Simulated transaction is null");
      }

      const txResult: EthereumTxSignResult = {
        transaction: simulatedTransaction,
      };

      data = {
        modal_type: "make_signature",
        chain_type: "eth",
        data: txResult,
      };
    }

    hideModal({ result: "approve", data });
  };

  return (
    <div className={styles.container}>
      <CommonModal>
        <div className={styles.header}>
          <div className={styles.title}>Signature Request</div>
          <div className={styles.closeButton} onClick={onReject}>
            <XCloseIcon
              className={styles.closeIcon}
              size={24}
              color="#A4A7AE"
            />
          </div>
        </div>
        <Spacing height={20} />
        <MakeSignatureModalContent data={payload.data} />
        <Spacing height={28} />
        <div className={styles.signWithKeplrBox}>
          <div className={styles.text}>Sign with</div>
          <LogoIcon height={10} width={10} />
          <LogoTextIcon
            width={33}
            style={{
              padding: 0,
            }}
          />
        </div>

        <Spacing height={32} />
        <div className={styles.buttonContainer}>
          <Button variant="secondary" size="md" fullWidth onClick={onReject}>
            <div className={styles.rejectButton}>Reject</div>
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onApprove}
            disabled={isApproveButtonDisabled}
          >
            <div className={styles.approveButton}>Approve</div>
          </Button>
        </div>
      </CommonModal>
      {isDemo && (
        <CommonModal padding="12px">
          <Typography
            size="xs"
            weight="medium"
            color="brand-tertiary"
            className={styles.demoDescription}
          >
            This signing request is for UI preview only.
          </Typography>
          <Typography
            size="xs"
            weight="medium"
            color="brand-tertiary"
            className={styles.demoDescription}
          >
            It will not be broadcast on-chain.
          </Typography>
        </CommonModal>
      )}
    </div>
  );
};

export interface MakeSignatureModalProps {
  payload: MakeSignatureModalPayload;
  hideModal: HideModalFn;
}
