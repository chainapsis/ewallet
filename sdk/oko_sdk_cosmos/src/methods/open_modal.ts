import type {
  EWalletMsgOpenModal,
  MakeCosmosSigData,
  OpenModalAckPayload,
} from "@oko-wallet/oko-sdk-core";
import { v4 as uuidv4 } from "uuid";

import type { CosmosEWalletInterface } from "@oko-wallet-sdk-cosmos/types";

export async function openModal(
  this: CosmosEWalletInterface,
  data: MakeCosmosSigData,
): Promise<OpenModalAckPayload> {
  const modal_id = uuidv4();

  const openModalMsg: EWalletMsgOpenModal = {
    target: "keplr_ewallet_attached",
    msg_type: "open_modal",
    payload: {
      modal_type: "cosmos/make_signature",
      modal_id,
      data,
    },
  };
  try {
    const modalResult = await this.eWallet.openModal(openModalMsg);

    if (!modalResult.success) {
      throw new Error("modal result not success");
    }

    this.eWallet.closeModal();

    return modalResult.data;
  } catch (err: any) {
    throw new Error(`Error getting modal response, err: ${err}`);
  }
}
