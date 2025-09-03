import type {
  EWalletMsgOpenModal,
  MakeCosmosSigData,
} from "@keplr-ewallet/ewallet-sdk-core";
import { v4 as uuidv4 } from "uuid";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import type { OpenModalResult } from "@keplr-ewallet-sdk-cosmos/types/modal";

export async function openModal(
  this: CosmosEWalletInterface,
  data: MakeCosmosSigData,
): Promise<OpenModalResult> {
  const modal_id = uuidv4();

  const openModalMsg: EWalletMsgOpenModal = {
    target: "keplr_ewallet_attached",
    msg_type: "open_modal",
    payload: {
      modal_type: "make_signature",
      modal_id,
      data,
    },
  };
  try {
    const modalResult = await this.eWallet.openModal(openModalMsg);

    await this.eWallet.closeModal();

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
    console.error(
      "[keplr-cosmos] modal_id: %s, unknown error: %s",
      modal_id,
      err,
    );

    return {
      approved: false,
      modal_id,
      reason: "Unknown error",
    };
  }
}
