import React, { useCallback } from "react";
import {
  useFloating,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  useId,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from "@floating-ui/react";
import { ErrorBoundary } from "react-error-boundary";
import type {
  EWalletMsgShowModal,
  EWalletMsgShowModalAck,
} from "@keplr-ewallet/ewallet-sdk-core";

import styles from "./modal.module.scss";
import { MakeSignatureModal } from "@keplr-ewallet-attached/components/modal/make_signature_modal/make_signature_modal";
import type { HideModalFn } from "./types";
import { EWALLET_SDK_TARGET } from "@keplr-ewallet-attached/window_msgs/target";
import { useModalState } from "@keplr-ewallet-attached/store/modal";

const ErrorFallback: React.FC = () => {
  return null;
};

const handleError = (
  error: Error,
  errorInfo: React.ErrorInfo,
  hideModal: HideModalFn,
) => {
  console.error("Modal Error Boundary caught an error:", error, errorInfo);
  hideModal({ result: "error", error: error.message });
};

const ModalDialog: React.FC<ModalDialogProps> = ({ msg, hideModal }) => {
  const { payload } = msg;

  const content = React.useMemo(() => {
    switch (payload.modal_type) {
      case "make_signature": {
        return <MakeSignatureModal payload={payload} hideModal={hideModal} />;
      }
      default:
    }
  }, [msg]);
  return <>{content}</>;
};

export const Modal: React.FC = () => {
  const showModalMsg = useModalState().showModalMsg;
  const setShowModalMsg = useModalState().setShowModalMsg;

  const isShowModal =
    !!showModalMsg && showModalMsg?.msg.msg_type === "show_modal";

  const hideModal: HideModalFn = ({ result, data, error }) => {
    if (showModalMsg) {
      let payload: EWalletMsgShowModalAck["payload"];

      if (result === "approve") {
        payload = {
          success: true,
          data: {
            approved: true,
            data: data ?? null,
          },
        };
      } else if (result === "reject") {
        payload = {
          success: true,
          data: {
            approved: false,
            reason: "User rejected the request",
          },
        };
      } else {
        payload = {
          success: false,
          err: error ?? "Unknown error",
        };
      }

      const ack: EWalletMsgShowModalAck = {
        target: EWALLET_SDK_TARGET,
        msg_type: "show_modal_ack",
        payload,
      };

      showModalMsg.port.postMessage(ack);
    }
    setShowModalMsg(null);
  };

  const onOpenChange = useCallback(
    async (open: boolean) => {
      if (showModalMsg && !open) {
        hideModal({ result: "reject" });
      }
    },
    [showModalMsg],
  );

  const { refs, context } = useFloating({
    open: isShowModal,
    onOpenChange,
  });

  const click = useClick(context);
  const role = useRole(context);
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    role,
    dismiss,
  ]);

  const headingId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        ref={refs.setReference}
        className={styles.invisible}
        {...getReferenceProps()}
      />
      <FloatingPortal>
        {isShowModal && (
          <FloatingOverlay className={styles.overlay} lockScroll>
            <FloatingFocusManager context={context}>
              <div
                ref={refs.setFloating}
                aria-labelledby={headingId}
                aria-describedby={descriptionId}
                {...getFloatingProps()}
              >
                <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  onError={(error, errorInfo) =>
                    handleError(error, errorInfo, hideModal)
                  }
                >
                  <ModalDialog msg={showModalMsg.msg} hideModal={hideModal} />
                </ErrorBoundary>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </>
  );
};

export interface ModalDialogProps {
  msg: EWalletMsgShowModal;
  hideModal: HideModalFn;
}
