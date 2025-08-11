import {
  runPresign,
  runSign,
  runTriples,
} from "@keplr-ewallet/cait-sith-keplr-hooks";

import { TSS_V1_ENDPOINT } from "@keplr-ewallet-attached/requests/api";

export async function makeSignOutput(
  hash: Uint8Array,
  publicKey: string,
  keyshare0: string,
  customerId: string,
  authToken: string,
) {
  const triplesRes = await runTriples(TSS_V1_ENDPOINT, customerId, authToken);
  if (triplesRes.success === false) {
    throw new Error(triplesRes.err);
  }

  const { triple0, triple1, sessionId } = triplesRes.data;

  const presignRes = await runPresign(
    TSS_V1_ENDPOINT,
    sessionId,
    {
      triple0,
      triple1,
    },
    {
      public_key: publicKey,
      private_share: keyshare0,
    },
    authToken,
  );
  if (presignRes.success === false) {
    throw new Error(presignRes.err);
  }

  const signOutput = await runSign(
    TSS_V1_ENDPOINT,
    sessionId,
    hash,
    presignRes.data,
    authToken,
  );
  if (signOutput.success === false) {
    throw new Error(signOutput.err);
  }

  return signOutput.data;
}
