"use client";

import React from "react";
import cn from "classnames";
import { useState } from "react";

import styles from "./preview_panel.module.scss";
import { LoginWidget } from "@/components/widgets/login_widget/login_widget";
import { EthereumOffchainSignWidget } from "@/components/widgets/ethereum_offchain_sign_widget/ethereum_offchain_sign_widget";
import { CosmosOnchainSignWidget } from "@/components/widgets/cosmos_onchain_sign_widget/cosmos_onchain_sign_widget";
import { CosmosOffChainSignWidget } from "@/components/widgets/cosmos_offchain_sign_widget/cosmos_offchain_sign_widget";
import { EthereumOnchainSignWidget } from "@/components/widgets/ethereum_onchain_sign_widget/ethereum_onchain_sign_widget";
import { CosmosOnchainCosmJsSignWidget } from "@/components/widgets/cosmos_onchain_cosmjs_sign_widget/cosmos_onchain_cosmjs_sign_widget";
import { ErrorWidget } from "@/components/widgets/error_widget/error_widget";

export const PreviewPanel = () => {
  return (
    <div className={styles.wrapper}>
      <div className={cn(styles.inner, "common-list-scroll")}>
        <div className={styles.col}>
          <LoginWidget />
        </div>
        <div className={styles.col}>
          <h2>Ethereum</h2>
          <EthereumOffchainSignWidget />
          <EthereumOnchainSignWidget />
        </div>
        <div className={styles.col}>
          <h2>Cosmos</h2>
          <CosmosOffChainSignWidget />
          <CosmosOnchainSignWidget />
        </div>
        <div className={styles.col}>
          <h2>Cosmos (cosmjs)</h2>
          <CosmosOnchainCosmJsSignWidget />
        </div>
        <div className={styles.col}>
          <h2>Error</h2>
          <ErrorWidget />
        </div>
        <div className={styles.col}></div>
      </div>
    </div>
  );
};
