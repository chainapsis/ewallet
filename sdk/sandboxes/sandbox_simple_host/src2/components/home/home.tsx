import React from "react";

import styles from "./home.module.scss";
import { Modal } from "@keplr-ewallet-attached/components/modal/modal";

export const Home: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <Modal />
    </div>
  );
};
