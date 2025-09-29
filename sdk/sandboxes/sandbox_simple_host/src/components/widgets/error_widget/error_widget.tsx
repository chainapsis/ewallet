import { useState, type FC } from "react";

import { Widget } from "../widget_components";
import styles from "./error_widget.module.scss";
import { useKeplrEwallet } from "@/hooks/use_keplr_ewallet";
import { useUserInfoState } from "@/state/user_info";
import { useAddresses } from "@/hooks/ewallet";
import type { EWalletMsgOpenModal } from "@keplr-ewallet/ewallet-sdk-core";

export const ErrorWidget: FC<LoginWidgetProps> = () => {
  const { cosmosEWallet } = useKeplrEwallet();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleClickError = async () => {
    try {
      if (cosmosEWallet) {
        setIsSigningIn(true);

        const eWallet = cosmosEWallet.eWallet;

        const invalidMsg = {
          target: "keplr_ewallet_attached",
          msg_type: "open_modal",
          payload: null,
        } as unknown as EWalletMsgOpenModal;

        eWallet.openModal(invalidMsg);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Widget>
      <div className={styles.container}>
        <div className={styles.title}>Trigger an error</div>
        <button onClick={handleClickError}>Error</button>
        {/* <div className={styles.walletBoxRow}>123</div> */}
      </div>
    </Widget>
  );
};

export interface LoginWidgetProps { }
