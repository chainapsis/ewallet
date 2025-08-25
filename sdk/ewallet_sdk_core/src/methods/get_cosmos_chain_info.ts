// import type { ChainInfo } from "@keplr-wallet/types";
//
// import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
// import { EWALLET_ATTACHED_TARGET } from "@keplr-ewallet-sdk-core/window_msg/target";
// import type { KeplrEWalletInterface } from "@keplr-ewallet-sdk-core/types";
//
// export async function getCosmosChainInfo(
//   this: KeplrEWalletInterface,
//   chainId?: string,
// ): Promise<ChainInfo[]> {
//   try {
//     const res = await this.sendMsgToIframe({
//       target: EWALLET_ATTACHED_TARGET,
//       msg_type: "get_cosmos_chain_info",
//       payload: {
//         chain_id: chainId ?? null,
//       },
//     });
//
//     if (res.msg_type === "get_cosmos_chain_info_ack" && res.payload.success) {
//       return res.payload.data;
//     }
//
//     throw new Error("Failed to get cosmos chain info");
//   } catch (error) {
//     console.error("[keplr] getCosmosChainInfo failed with error:", error);
//     throw error;
//   }
// }
