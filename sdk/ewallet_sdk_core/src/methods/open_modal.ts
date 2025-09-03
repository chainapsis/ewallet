import type {
  EWalletMsgOpenModal,
  KeplrEWalletInterface,
  ModalResult,
} from "@keplr-ewallet-sdk-core/types";

// 5 minutes in ms
const WAIT_TIME = 60 * 5 * 1000;

export async function openModal(
  this: KeplrEWalletInterface,
  msg: EWalletMsgOpenModal,
): Promise<ModalResult> {
  await this.waitUntilInitialized;

  let timeoutId: NodeJS.Timeout | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Show modal timeout")),
      WAIT_TIME,
    );
  });

  try {
    this.iframe.style.display = "block";

    const openModalAck = await Promise.race([
      this.sendMsgToIframe(msg),
      timeout,
    ]);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (openModalAck.msg_type !== "open_modal_ack") {
      throw new Error("Unreachable");
    }

    if (!openModalAck.payload.success) {
      throw new Error(openModalAck.payload.err);
    }

    return openModalAck.payload.data;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (error instanceof Error && error.message === "Show modal timeout") {
      await this.closeModal();
      throw new Error("Show modal timeout");
    }

    throw error;
  }
}
