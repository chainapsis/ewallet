import type {
  EWalletMsgShowModal,
  MakeCosmosSigData,
  MakeCosmosSigResult,
  ModalResult,
} from "@keplr-ewallet/ewallet-sdk-core";
import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function showModal(
  this: CosmosEWallet,
  data: MakeCosmosSigData,
): Promise<
  | {
      approved: true;
      data: MakeCosmosSigResult;
    }
  | {
      approved: false;
      reason?: string;
    }
> {
  const showModalMsg: EWalletMsgShowModal = {
    target: "keplr_ewallet_attached",
    msg_type: "show_modal",
    payload: {
      modal_type: "make_signature",
      data,
    },
  };

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
}
