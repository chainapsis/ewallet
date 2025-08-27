/**
 * Compute if the public key has changed
 * @param current - The current public key
 * @param next - The next public key
 * @returns True if the public key has changed with the next public key in normalized form/null, false otherwise
 */
export function computePublicKeyChange(
  current: string | null,
  next: string | null,
): { changed: boolean; normalizedNext: string | null } {
  const nCurrent = normalize(current);
  const nNext = normalize(next);

  const changed =
    (nCurrent === null && nNext !== null) ||
    (nCurrent !== null && nNext === null) ||
    (nCurrent !== null && nNext !== null && nCurrent !== nNext);

  return { changed, normalizedNext: nNext };
}

function normalize(key: string | null): string | null {
  if (key === null || key === "") return null;
  return key.toLowerCase().startsWith("0x")
    ? key.slice(2).toLowerCase()
    : key.toLowerCase();
}
