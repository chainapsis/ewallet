import React, { useState } from "react";

import { Widget } from "../widget_components";
import styles from "./login_widget.module.scss";
import { useKeplrEwallet } from "@/hooks/use_keplr_ewallet";
import { useUserInfoState } from "@/state/user_info";
import { useAddresses } from "@/hooks/ewallet";

export const LoginWidget: React.FC<LoginWidgetProps> = () => {
  const { cosmosEWallet } = useKeplrEwallet();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { isSignedIn, email, publicKey } = useUserInfoState();
  const { cosmosAddress, ethAddress } = useAddresses();

  const handleSignIn = async () => {
    try {
      if (cosmosEWallet) {
        setIsSigningIn(true);

        const eWallet = cosmosEWallet.eWallet;
        await eWallet.signIn("google");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (cosmosEWallet) {
      await cosmosEWallet.eWallet.signOut();
    }
  };

  if (isSigningIn) {
    return (
      <Widget>
        <div className={styles.signingInWrapper}>
          <div className={styles.googleCircle}>google</div>
          <p>Signing in</p>
        </div>
      </Widget>
    );
  }

  if (isSignedIn) {
    return (
      <Widget>
        <div className={styles.loginInfoContainer}>
          <div className={styles.loginInfoRow}>
            <p className={styles.value}>{email}</p>
            <button className={styles.signOutButton} onClick={handleSignOut}>
              <p>Sign out</p>
            </button>
          </div>
          <div className={styles.publicKeyRow}>
            <p className={styles.label}>Public Key</p>
            <p className={styles.value}>{publicKey}</p>
          </div>
          <div className={styles.addressRow}>
            <p className={styles.label}>Eth Address</p>
            <p className={styles.value}>{ethAddress}</p>
          </div>
          <div className={styles.addressRow}>
            <p className={styles.label}>Cosmos Address</p>
            <p className={styles.value}>{cosmosAddress}</p>
          </div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>logo</div>
        <button onClick={handleSignIn}>Google Login</button>
        <div className={styles.walletBoxRow}>
          {/* <WalletBox icon={<KeplrIcon />} label="Keplr" /> */}
          {/* <WalletBox icon={<MetamaskIcon />} label="Metamask" /> */}
          {/* <WalletBox icon={<LeapIcon />} label="Leap" /> */}
        </div>
      </div>
    </Widget>
  );
};

export interface LoginWidgetProps {}
