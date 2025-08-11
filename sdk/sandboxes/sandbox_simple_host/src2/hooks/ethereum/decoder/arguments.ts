import { isAddress } from "viem";

const expectedArgTypes: Record<
  string,
  Array<Array<"address" | "uint256" | "bool" | "bytes" | "uint256[]" | "bytes">>
> = {
  transfer: [["address", "uint256"]],
  transferFrom: [["address", "address", "uint256"]],
  approve: [["address", "uint256"]],
  safeTransferFrom: [
    ["address", "address", "uint256"],
    ["address", "address", "uint256", "bytes"],
    ["address", "address", "uint256", "uint256", "bytes"],
  ],
  setApprovalForAll: [["address", "bool"]],
  safeBatchTransferFrom: [
    ["address", "address", "uint256[]", "uint256[]", "bytes"],
  ],
};

function isTypeMatch(value: unknown, type: string): boolean {
  switch (type) {
    case "address":
      return typeof value === "string" && isAddress(value);
    case "uint256":
      return typeof value === "bigint";
    case "bool":
      return typeof value === "boolean";
    case "uint256[]":
      return Array.isArray(value) && value.every((v) => typeof v === "bigint");
    case "bytes":
      return typeof value === "string" && value.startsWith("0x");
    default:
      return true;
  }
}

export function validateArgsForFunction(
  fnName: string,
  args: unknown[],
): boolean {
  const signatures = expectedArgTypes[fnName];
  if (!signatures) return false;

  return signatures.some((expected) => {
    return (
      expected.length === args.length &&
      expected.every((type, idx) => isTypeMatch(args[idx], type))
    );
  });
}
