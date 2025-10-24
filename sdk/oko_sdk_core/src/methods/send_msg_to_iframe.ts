import type {
  EWalletMsg,
  KeplrEWalletInterface,
} from "@oko-wallet-sdk-core/types";

export async function sendMsgToIframe(
  this: KeplrEWalletInterface,
  msg: EWalletMsg,
): Promise<EWalletMsg> {
  await this.waitUntilInitialized;

  const contentWindow = this.iframe.contentWindow;
  if (contentWindow === null) {
    throw new Error("iframe contentWindow is null");
  }

  return new Promise<EWalletMsg>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event: MessageEvent) => {
      const data = event.data as EWalletMsg;

      console.debug("[keplr] reply recv", data);

      if (data.hasOwnProperty("payload")) {
        resolve(data);
      } else {
        console.error("[keplr] unknown msg type");
        resolve({
          target: "keplr_ewallet_sdk",
          msg_type: "unknown_msg_type",
          payload: JSON.stringify(data),
        });
      }
    };

    contentWindow.postMessage(msg, this.sdkEndpoint, [channel.port2]);
  });
}
