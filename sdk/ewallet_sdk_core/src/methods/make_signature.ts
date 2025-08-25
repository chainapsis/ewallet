import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type {
  EWalletMsgMakeSignature,
  KeplrEWalletInterface,
  SignOutput,
} from "@keplr-ewallet-sdk-core/types";

export async function makeSignature(
  this: KeplrEWalletInterface,
  msg: EWalletMsgMakeSignature,
): Promise<SignOutput> {
  await this.waitUntilInitialized;

  const res = await this.sendMsgToIframe(msg);

  if (res.msg_type !== "make_signature_ack") {
    throw new Error("Unreachable");
  }

  if (!res.payload.success) {
    throw new Error(res.payload.err);
  }

  return res.payload.data;
}
