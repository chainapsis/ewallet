import type {
  EWalletMsgOpenModal,
  KeplrEWalletInterface,
  OpenModalAckPayload,
} from "@keplr-ewallet-sdk-core/types";

// 5 minutes in ms
const WAIT_TIME = 60 * 5 * 1000;

export async function openModal(
  this: KeplrEWalletInterface,
  msg: EWalletMsgOpenModal,
): Promise<OpenModalAckPayload> {
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
      console.log(2);
      throw new Error("Unreachable");
    }

    if (openModalAck.payload.status !== "approved") {
      console.log(3);
      throw new Error(openModalAck.payload.toString());
    }

    return openModalAck.payload;
  } catch (error) {
    console.log(4);
    if (error instanceof Error && error.message === "Show modal timeout") {
      console.log(5);
      // this.closeModal();
      throw new Error("Show modal timeout");
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    this.closeModal();
  }
}
