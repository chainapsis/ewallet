import type {
  EWalletMsgShowModal,
  MakeCosmosSigData,
} from "@keplr-ewallet/ewallet-sdk-core";
import { v4 as uuidv4 } from "uuid";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import type { ShowModalResult } from "@keplr-ewallet-sdk-cosmos/types/modal";

export async function showModal(
  this: CosmosEWalletInterface,
  data: MakeCosmosSigData,
): Promise<ShowModalResult> {
  const modal_id = uuidv4();

  const showModalMsg: EWalletMsgShowModal = {
    target: "keplr_ewallet_attached",
    msg_type: "show_modal",
    payload: {
      modal_type: "make_signature",
      modal_id,
      data,
    },
  };
  try {
    const modalResult = await this.eWallet.showModal(showModalMsg);

    await this.eWallet.hideModal();

    if (!modalResult.approved) {
      return {
        approved: false,
        modal_id,
        reason: modalResult.reason,
      };
    }

    if (
      modalResult.data?.chain_type === "cosmos" &&
      modalResult.data?.modal_type === "make_signature"
    ) {
      return {
        approved: true,
        modal_id,
        data: modalResult.data?.data,
      };
    }

    return {
      approved: false,
      modal_id,
      reason: "Invalid modal result",
    };
  } catch (err: any) {
    console.error("[keplr-cosmos] modal_id: %s, unknown error: %s", modal_id, err);

    return {
      approved: false,
      modal_id,
      reason: "Unknown error",
    };
  }
}
