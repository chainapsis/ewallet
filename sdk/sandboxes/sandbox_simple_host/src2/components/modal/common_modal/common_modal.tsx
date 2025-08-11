import React, { type PropsWithChildren } from "react";

import styles from "./common_modal.module.scss";

export interface CommonModalProps {
  padding?: string;
}

export const CommonModal: React.FC<PropsWithChildren<CommonModalProps>> = ({
  children,
  padding,
}) => {
  return (
    <div className={styles.modalContainer} style={{ padding }}>
      {children}
    </div>
  );
};
