import { type Hex } from "viem";

export function computePublicKeyChange(
  current: Hex | null,
  next: string | null,
): { changed: boolean; next: Hex | null } {
  let nextHex: Hex | null = null;
  if (next) {
    nextHex = (next.startsWith("0x") ? next : `0x${next}`) as Hex;
  }

  const changed =
    (current === null && nextHex !== null) ||
    (current !== null && nextHex === null) ||
    (current !== null &&
      nextHex !== null &&
      current.toLowerCase() !== nextHex.toLowerCase());

  return { changed, next: nextHex };
}
