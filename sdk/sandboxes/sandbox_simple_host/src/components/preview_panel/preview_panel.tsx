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

export const PreviewPanel = () => {
  // const [queryClient] = useState(
  //   () =>
  //     new QueryClient({
  //       defaultOptions: {
  //         queries: {
  //           retry: 1,
  //           refetchOnWindowFocus: false,
  //         },
  //       },
  //     }),
  // );

  return (
    <div className={styles.wrapper}>
      <div className={cn(styles.inner, "common-list-scroll")}>
        <div className={styles.col}>
          <LoginWidget />
          {/* <AddressWidget /> */}
          {/* <UserDataWidget userData={mockUserData} /> */}
        </div>
        <div className={styles.col}>
          <h2>Ethereum</h2>
          <EthereumOffchainSignWidget />
          <EthereumOnchainSignWidget />
        </div>
        {/*   <SignWidget */}
        {/*     chain="Ethereum" */}
        {/*     chainIcon={<EthereumIcon />} */}
        {/*     signType="onchain" */}
        {/*     signButtonOnClick={() => {}} */}
        {/*   /> */}
        {/*   <DocsWidget /> */}
        {/* </div> */}

        <div className={styles.col}>
          <h2>Cosmos</h2>
          <CosmosOffChainSignWidget />
          <CosmosOnchainSignWidget />
        </div>
        <div className={styles.col}>
          <h2>Cosmos (cosmjs)</h2>
          <CosmosOnchainCosmJsSignWidget />
        </div>
      </div>
    </div>
  );
};
