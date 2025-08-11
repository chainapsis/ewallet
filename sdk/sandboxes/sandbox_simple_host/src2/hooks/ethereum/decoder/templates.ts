export type TemplateConfig = {
  functionName: string;
  standard: "ERC20" | "ERC721" | "ERC1155";
  argCount: number;
  template: string;
  argMap: Record<string, number>;
  extraVars?: (args: unknown[]) => Record<string, string>;
};

export const templates: TemplateConfig[] = [
  {
    functionName: "transfer",
    standard: "ERC20",
    argCount: 2,
    template: "Send {amount} {symbol} to {to}",
    argMap: { to: 0, amount: 1 },
  },
  {
    functionName: "transferFrom",
    standard: "ERC20",
    argCount: 3,
    template: "Transfer {amount} {symbol} from {from} to {to}",
    argMap: { from: 0, to: 1, amount: 2 },
  },
  {
    functionName: "approve",
    standard: "ERC20",
    argCount: 2,
    template: "Approve {spender} to spend {amount} {symbol}",
    argMap: { spender: 0, amount: 1 },
  },
  {
    functionName: "safeTransferFrom",
    standard: "ERC721",
    argCount: 3,
    template: "Transfer NFT #{tokenId} from {from} to {to}",
    argMap: { from: 0, to: 1, tokenId: 2 },
  },
  {
    functionName: "safeTransferFrom",
    standard: "ERC721",
    argCount: 4,
    template: "Transfer NFT #{tokenId} from {from} to {to}",
    argMap: { from: 0, to: 1, tokenId: 2 },
  },
  {
    functionName: "transferFrom",
    standard: "ERC721",
    argCount: 3,
    template: "Transfer NFT #{tokenId} from {from} to {to}",
    argMap: { from: 0, to: 1, tokenId: 2 },
  },
  {
    functionName: "approve",
    standard: "ERC721",
    argCount: 2,
    template: "Approve {to} to manage NFT #{tokenId}",
    argMap: { to: 0, tokenId: 1 },
  },
  {
    functionName: "setApprovalForAll",
    standard: "ERC721",
    argCount: 2,
    template: "{action} permission for {operator} to manage all NFTs",
    argMap: { operator: 0 },
    extraVars: ([, approved]) => ({
      action: (approved as boolean) ? "Grant" : "Revoke",
    }),
  },
  {
    functionName: "safeTransferFrom",
    standard: "ERC1155",
    argCount: 5,
    template: "Transfer {amount} of token ID {id} from {from} to {to}",
    argMap: { from: 0, to: 1, id: 2, amount: 3 },
  },
  {
    functionName: "safeBatchTransferFrom",
    standard: "ERC1155",
    argCount: 5,
    template: "Transfer multiple tokens from {from} to {to}: {pairs}",
    argMap: { from: 0, to: 1 },
    extraVars: ([, , ids, amts]) => ({
      pairs: (ids as bigint[])
        .map(
          (id, i) =>
            `ID ${id.toString()} × ${(amts as bigint[])[i].toString()}`,
        )
        .join(", "),
    }),
  },
  {
    functionName: "setApprovalForAll",
    standard: "ERC1155",
    argCount: 2,
    template: "{action} permission for {operator} to manage all ERC1155 tokens",
    argMap: { operator: 0 },
    extraVars: ([, approved]) => ({
      action: (approved as boolean) ? "Grant" : "Revoke",
    }),
  },
];

export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}
