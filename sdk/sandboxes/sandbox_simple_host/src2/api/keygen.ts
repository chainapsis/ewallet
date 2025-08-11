import { runKeygen } from "@keplr-ewallet/cait-sith-keplr-hooks";
import type { KeygenOutput } from "@keplr-ewallet/tecdsa-interface";
import { runSplit } from "@keplr-ewallet/sss";

import { requestSendKeyShares } from "@keplr-ewallet-attached/requests/cv";
import { TSS_V1_ENDPOINT } from "@keplr-ewallet-attached/requests/api";
import type { KeygenRequest } from "@keplr-ewallet/ewallet-types";
import { reqKeygen } from "@keplr-ewallet/api-lib";

const THRESHOLD_N = 2;
const THRESHOLD_T = 2;

interface KeyGenResult {
  publicKey: string;
  walletId: string;
}

export async function generateNewUserKey(
  idToken: string,
  email: string,
): Promise<KeyGenResult> {
  try {
    const keygenRes = await runKeygen();

    if (keygenRes.success === false) {
      throw new Error(keygenRes.err);
    }
    const { keygen_0, keygen_1 } = keygenRes.data;

    // send request to CVs first
    await splitAndSendKeyShare(idToken, keygen_0);

    const keygenRequest: KeygenRequest = {
      email,
      keygen_1,
    };

    // send request to TSS server
    const reqKeygenRes = await reqKeygen(
      TSS_V1_ENDPOINT,
      keygenRequest,
      idToken,
    );

    if (reqKeygenRes.success === false) {
      throw new Error(reqKeygenRes.msg);
    }

    const { wallet_id } = reqKeygenRes.data.user;

    console.debug("[attached] keygen_0", keygen_0);
    console.debug("[attached] wallet_id", wallet_id);

    return {
      publicKey: keygen_0.public_key,
      walletId: wallet_id,
    };
  } catch (error: any) {
    console.error("[attached] error generating a key, err: %s", error);

    throw error;
  }
}

async function splitAndSendKeyShare(idToken: string, keygen_0: KeygenOutput) {
  try {
    const shares = await runSplit(
      keygen_0.private_share,
      THRESHOLD_N,
      THRESHOLD_T,
    );

    console.debug("[attached] split keygen result: ", shares);

    const publicKey = keygen_0.public_key;

    await requestSendKeyShares(THRESHOLD_N, idToken, publicKey, shares);
  } catch (error: any) {
    console.error("Error in splitAndSendKeyShare:", error);

    throw error;
  }
}
