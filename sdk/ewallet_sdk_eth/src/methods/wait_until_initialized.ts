// import { type EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
// import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";
//
// export async function waitUntilInitialized(
//   this: EthEWalletInterface,
// ): Promise<void> {
//   console.log("[eth] waitUntilInitialized: start");
//
//   try {
//     // if (!this.eWallet.isInitialized) {
//     //   if (this.eWallet.initError) {
//     //     throw new Error(this.eWallet.initError);
//     //   }
//     //   console.log("[eth] waitUntilInitialized: awaiting core initialization");
//     //   await this.eWallet.waitUntilInitialized;
//     // } else {
//     //   console.log("[eth] waitUntilInitialized: core already initialized");
//     // }
//
//     if (!this.provider) {
//       console.log("[eth] waitUntilInitialized: initializing provider");
//       await this.getEthereumProvider();
//     }
//   } catch (error: any) {
//     console.error("[eth] waitUntilInitialized failed with error:", error);
//     throw error;
//   }
// }
