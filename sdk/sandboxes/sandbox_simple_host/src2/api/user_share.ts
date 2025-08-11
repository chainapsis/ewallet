import { requestSplitShares } from "@keplr-ewallet-attached/requests/cv";
import { runCombine } from "@keplr-ewallet/sss";

export async function combineUserShares(
  publicKey: string,
  idToken: string,
): Promise<string> {
  const keyShares = await requestSplitShares(publicKey, idToken);

  console.log("keyShares", keyShares);

  return await runCombine(keyShares);
}
