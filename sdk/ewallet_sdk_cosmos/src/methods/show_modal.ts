import type {
  EWalletMsgShowModal,
  MakeCosmosSigData,
  MakeCosmosSigResult,
  ModalResult,
} from "@keplr-ewallet/ewallet-sdk-core";
import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import type { ShowModalResult } from "@keplr-ewallet-sdk-cosmos/types/modal";

export async function showModal(
  this: CosmosEWalletInterface,
  data: MakeCosmosSigData,
): Promise<ShowModalResult> {
  const showModalMsg: EWalletMsgShowModal = {
    target: "keplr_ewallet_attached",
    msg_type: "show_modal",
    payload: {
      modal_type: "make_signature",
      data,
    },
  };
  try {
    const modalResult = await this.eWallet.showModal(showModalMsg);

    await this.eWallet.hideModal();

    if (!modalResult.approved) {
      return {
        approved: false,
        reason: modalResult.reason,
      };
    }

    if (
      modalResult.data?.chain_type === "cosmos" &&
      modalResult.data?.modal_type === "make_signature"
    ) {
      return {
        approved: true,
        data: modalResult.data?.data,
      };
    }

    return {
      approved: false,
      reason: "Invalid modal result",
    };
  } catch (error) {
    console.error("[showModal cosmos] [unknown error]", error);
    return {
      approved: false,
      reason: "Unknown error",
    };
  }
}
