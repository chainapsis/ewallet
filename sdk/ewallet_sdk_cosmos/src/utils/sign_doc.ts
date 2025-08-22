import {
  TxBody,
  AuthInfo,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";

import { sortObjectByKey } from "@keplr-ewallet-sdk-cosmos/utils/json";
import type { SignDoc } from "@keplr-ewallet-sdk-cosmos/types/sign";

export function extractAuthInfoFromSignDoc(signDoc: SignDoc): AuthInfo | null {
  const authInfoBytes = (signDoc as any).authInfoBytes;
  if (!authInfoBytes) {
    return null;
  }

  try {
    const authInfo = AuthInfo.decode(authInfoBytes);
    return authInfo;
  } catch {
    return null;
  }
}

export function extractTxBodyFromSignDoc(signDoc: SignDoc): TxBody | null {
  const bodyBytes = (signDoc as any).bodyBytes;
  if (!bodyBytes) {
    return null;
  }

  try {
    const txBody = TxBody.decode(bodyBytes);
    return txBody;
  } catch (error) {
    console.warn("Failed to decode TxBody:", error);
    return null;
  }
}

export function signDocToJson(signDoc: SignDoc): any {
  const authInfo = extractAuthInfoFromSignDoc(signDoc);
  const txBody = extractTxBodyFromSignDoc(signDoc);

  if (!authInfo) {
    throw new Error("authInfo is null");
  }

  if (!txBody) {
    throw new Error("txBody is null");
  }

  return sortObjectByKey({
    txBody: {
      ...(TxBody.toJSON(txBody) as any),
      ...{
        messages: txBody.messages.map((msg) => {
          return {
            typeUrl: msg.typeUrl,
            value: Buffer.from(msg.value).toString("base64"),
          };
        }),
      },
    },
    authInfo: AuthInfo.toJSON(authInfo),
    chainId: signDoc.chainId,
    accountNumber: signDoc.accountNumber.toString(),
  });
}
