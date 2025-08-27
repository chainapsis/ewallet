import type {
  Address,
  AddEthereumChainParameter as RpcChain,
  RpcError,
  TypedDataDefinition,
} from "viem";
import {
  hexToString,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  isAddressEqual,
  ProviderDisconnectedError,
  ChainDisconnectedError,
  ResourceUnavailableRpcError,
  serializeTypedData,
  UnsupportedChainIdError,
  UnsupportedProviderMethodError,
  isAddress,
  UnauthorizedProviderError,
} from "viem";
import { v4 as uuidv4 } from "uuid";

import type { EthSigner } from "@keplr-ewallet-sdk-eth/types";
import type {
  RpcMethod,
  RpcResponse,
  RpcRequestArgs,
  RpcResponseData,
  PublicRpcMethod,
  WalletRpcMethod,
} from "@keplr-ewallet-sdk-eth/rpc";
import { PUBLIC_RPC_METHODS } from "@keplr-ewallet-sdk-eth/rpc";
import {
  parseTypedData,
  isValidChainId,
  validateChain,
} from "@keplr-ewallet-sdk-eth/utils";
import type {
  EIP1193Provider,
  EWalletEIP1193ProviderOptions,
  ProviderConnectInfo,
  RpcChainWithStatus,
} from "@keplr-ewallet-sdk-eth/provider";
import { ProviderEventEmitter, VERSION } from "@keplr-ewallet-sdk-eth/provider";

export class EWalletEIP1193Provider
  extends ProviderEventEmitter
  implements EIP1193Provider
{
  protected signer: EthSigner | null;

  protected activeChain: RpcChain;
  protected addedChains: RpcChainWithStatus[];

  private lastConnectedEmittedEvent: "connect" | "disconnect" | null;

  public readonly version: string = VERSION;
  public readonly name: string = "EWalletEIP1193Provider";

  constructor(options: EWalletEIP1193ProviderOptions) {
    super();

    this.lastConnectedEmittedEvent = null;

    if (options.chains.length === 0) {
      throw new Error("No chains provided");
    }

    for (const chain of options.chains) {
      const result = validateChain(chain);
      if (result.error) {
        throw new Error(result.error);
      }
    }

    this.signer = options.signer ?? null;

    this.addedChains = options.chains.map((chain) => ({
      ...chain,
      connected: false,
    }));

    this.activeChain = this.addedChains[0];

    this._handleConnected(true, { chainId: this.activeChain.chainId });

    this.request = this.request.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
  }

  get chainId(): string {
    return this.activeChain.chainId;
  }

  get isConnected(): boolean {
    return this.addedChains.some((chain) => chain.connected);
  }

  /**
   * Request an RPC method
   * @param args - The RPC request arguments to handle
   * @returns The RPC response data
   * @throws RpcError if the request fails
   */
  async request<M extends RpcMethod>(
    args: RpcRequestArgs<M>,
  ): Promise<RpcResponseData<M>> {
    this.validateRequestArgs(args);

    try {
      return await this.handleRequest(args);
    } catch (error: any) {
      if (this.isConnectionError(error)) {
        const rpcError = new ResourceUnavailableRpcError(
          new Error(error?.message || "Resource unavailable"),
        );

        this._handleConnected(false, rpcError);
        throw rpcError;
      }

      throw error;
    }
  }

  /**
   * Handle RPC request under the hood
   * @param args - The RPC request arguments to handle
   * @returns The RPC response data
   * @throws RpcError if the request fails
   */
  protected async handleRequest<M extends RpcMethod>(
    args: RpcRequestArgs<M>,
  ): Promise<RpcResponseData<M>> {
    if (PUBLIC_RPC_METHODS.has(args.method as PublicRpcMethod)) {
      const result = await this.handlePublicRpcRequest(
        args as RpcRequestArgs<PublicRpcMethod>,
      );

      this._handleConnected(true, { chainId: this.activeChain.chainId });

      return result;
    }

    return this.handleWalletRpcRequest(args as RpcRequestArgs<WalletRpcMethod>);
  }

  /**
   * Handle public RPC request under the hood
   * @param args - The RPC request arguments to handle
   * @returns The RPC response data
   * @throws RpcError if the request fails
   */
  protected async handlePublicRpcRequest<M extends PublicRpcMethod>(
    args: RpcRequestArgs<M>,
  ): Promise<RpcResponseData<M>> {
    switch (args.method) {
      case "web3_clientVersion":
        return `${this.name}/${this.version}`;
      case "eth_chainId":
        return this.activeChain.chainId;
      default:
        const {
          rpcUrls: [rpcUrl],
        } = this.activeChain;
        if (!rpcUrl) {
          throw new ProviderDisconnectedError(
            new Error("No RPC URL for the active chain"),
          );
        }

        const requestBody = {
          ...args,
          jsonrpc: "2.0",
          id: uuidv4(),
        };

        const res = await fetch(rpcUrl, {
          method: "POST",
          body: JSON.stringify(requestBody),
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await res.json()) as RpcResponse<RpcResponseData<M>>;

        if ("error" in data) {
          throw data.error;
        }
        return data.result;
    }
  }

  /**
   * Handle wallet RPC request under the hood
   * @param args - The RPC request arguments to handle
   * @returns The RPC response data
   * @throws RpcError if the request fails
   * @dev Signer is required for wallet RPC methods
   */
  protected async handleWalletRpcRequest<M extends WalletRpcMethod>(
    args: RpcRequestArgs<M>,
  ): Promise<RpcResponseData<M>> {
    // Handle non-restricted wallet RPC methods
    switch (args.method) {
      case "wallet_addEthereumChain": {
        const [newChain] =
          args.params as RpcRequestArgs<"wallet_addEthereumChain">["params"];
        const validation = validateChain(newChain);
        if (!validation.isValid) {
          throw new InvalidParamsRpcError(
            new Error(validation.error || "Invalid chain parameter"),
          );
        }
        const existing = this.addedChains.find(
          (c) => c.chainId === newChain.chainId,
        );
        if (existing) {
          Object.assign(existing, newChain);
          existing.connected = false;
        } else {
          this.addedChains.push({ ...newChain, connected: false });
        }
        return null;
      }
      case "wallet_switchEthereumChain": {
        const [{ chainId: chainIdToSwitch }] =
          args.params as RpcRequestArgs<"wallet_switchEthereumChain">["params"];

        const chain = this.addedChains.find(
          (chain) => chain.chainId === chainIdToSwitch,
        );

        if (!chain) {
          throw new UnsupportedChainIdError(new Error("Chain not found"));
        }

        const prevChainId = this.activeChain?.chainId;
        this.activeChain = chain;

        if (prevChainId !== chainIdToSwitch) {
          this._handleChainChanged(chainIdToSwitch);
        }
        this._handleConnected(true, { chainId: chainIdToSwitch });

        return null;
      }
      default:
        break;
    }

    // Handle restricted wallet RPC methods
    switch (args.method) {
      case "eth_accounts":
      case "eth_requestAccounts":
        this._handleConnected(true, { chainId: this.activeChain.chainId });

        try {
          const { address } = this._getAuthenticatedSigner();
          return [address];
        } catch {
          return [];
        }
      case "eth_sendTransaction":
        const [tx] =
          args.params as RpcRequestArgs<"eth_sendTransaction">["params"];
        const signedTx = await this.request({
          method: "eth_signTransaction",
          params: [tx],
        });

        const txHash = await this.request({
          method: "eth_sendRawTransaction",
          params: [signedTx],
        });

        this._handleConnected(true, { chainId: this.activeChain?.chainId });

        return txHash;
      case "eth_signTransaction": {
        const [tx] =
          args.params as RpcRequestArgs<"eth_signTransaction">["params"];

        const { signer, address } = this._getAuthenticatedSigner();

        const result = await signer.sign({
          type: "sign_transaction",
          data: {
            address,
            transaction: tx,
          },
        });

        if (result.type !== "signed_transaction") {
          throw new Error("Invalid result type");
        }

        this._handleConnected(true, { chainId: this.activeChain.chainId });

        return result.signedTransaction;
      }
      case "eth_signTypedData_v4": {
        const [signWith, rawTypedData] =
          args.params as RpcRequestArgs<"eth_signTypedData_v4">["params"];

        const { signer, address } = this._getAuthenticatedSigner();

        if (!isAddressEqual(signWith, address)) {
          throw new InvalidInputRpcError(new Error("Signer address mismatch"));
        }

        const typedData =
          typeof rawTypedData === "string"
            ? parseTypedData<TypedDataDefinition>(rawTypedData)
            : rawTypedData;

        const result = await signer.sign({
          type: "sign_typedData_v4",
          data: {
            address,
            serializedTypedData: serializeTypedData(typedData),
          },
        });

        if (result.type !== "signature") {
          throw new Error("Invalid result type");
        }

        this._handleConnected(true, { chainId: this.activeChain.chainId });

        return result.signature;
      }
      case "personal_sign": {
        const [message, signWith] =
          args.params as RpcRequestArgs<"personal_sign">["params"];

        const { signer, address } = this._getAuthenticatedSigner();

        if (!isAddressEqual(signWith, address)) {
          throw new InvalidInputRpcError(new Error("Signer address mismatch"));
        }

        const originalMessage = message.startsWith("0x")
          ? hexToString(message)
          : message;

        const result = await signer.sign({
          type: "personal_sign",
          data: {
            address,
            message: originalMessage,
          },
        });

        if (result.type !== "signature") {
          throw new Error("Invalid result type");
        }

        this._handleConnected(true, { chainId: this.activeChain.chainId });

        return result.signature;
      }
      default:
        throw new UnsupportedProviderMethodError(
          new Error("Method not supported"),
        );
    }
  }

  /**
   * Get signer & address or throw if not authenticated
   */
  private _getAuthenticatedSigner(): {
    signer: EthSigner;
    address: Address;
  } {
    const signer = this.signer;

    if (!signer) {
      throw new UnauthorizedProviderError(
        new Error("Signer is required for wallet RPC methods"),
      );
    }

    const address = signer.getAddress();
    if (!address || !isAddress(address)) {
      throw new UnauthorizedProviderError(
        new Error("No authenticated signer for wallet RPC methods"),
      );
    }
    return { signer, address };
  }

  /**
   * Validates the basic structure of RPC request arguments
   * @param args - The RPC request arguments to validate
   * @throws RpcError if the arguments are invalid
   */
  protected validateRequestArgs<M extends RpcMethod>(
    args: RpcRequestArgs<M>,
  ): void {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw new InvalidParamsRpcError(
        new Error("Expected a single, non-array, object argument."),
      );
    }

    const { method, params } = args;

    if (typeof method !== "string" || method.length === 0) {
      throw new InvalidParamsRpcError(
        new Error("Expected a non-empty string for method."),
      );
    }

    if (typeof params !== "undefined" && typeof params !== "object") {
      throw new InvalidParamsRpcError(
        new Error("Expected a single, non-array, object argument."),
      );
    }

    if (
      params !== undefined &&
      !Array.isArray(params) &&
      (typeof params !== "object" || params === null)
    ) {
      throw new InvalidParamsRpcError(
        new Error("Expected a single, non-array, object argument."),
      );
    }
  }

  /**
   * Central method to manage connection state and emit events
   * Prevents duplicate events and ensures proper state transitions
   * @param connected - Whether the connection is established
   * @param data - The data to emit
   */
  protected _handleConnected(
    connected: boolean,
    data: ProviderConnectInfo | RpcError,
  ): void {
    if (this.activeChain) {
      const activeChainId = this.activeChain.chainId;

      this.addedChains.forEach((chain) => {
        chain.connected = chain.chainId === activeChainId ? connected : false;
      });
    }

    if (connected && this.lastConnectedEmittedEvent !== "connect") {
      this.emit("connect", data as ProviderConnectInfo);
      this.lastConnectedEmittedEvent = "connect";
    } else if (
      !connected &&
      this.addedChains.every(({ connected }) => !connected) &&
      this.lastConnectedEmittedEvent !== "disconnect"
    ) {
      this.emit("disconnect", data as RpcError);
      this.lastConnectedEmittedEvent = "disconnect";
    }
  }

  /**
   * Checks if the error is a connection error
   * @param error - The error to check
   * @returns True if the error is a connection error, false otherwise
   */
  protected isConnectionError(error: any): boolean {
    if (error?.name === "TypeError" || error instanceof TypeError) {
      const message = error.message?.toLowerCase() || "";
      if (
        message.includes("fetch failed") ||
        message.includes("failed to fetch") ||
        message.includes("network error") ||
        message.includes("load failed") ||
        message.includes("networkerror when attempting to fetch")
      ) {
        return true;
      }
    }

    if (error instanceof SyntaxError && error.message?.includes("JSON")) {
      return true;
    }

    if (
      error?.code === ProviderDisconnectedError.code ||
      error?.code === ChainDisconnectedError.code
    ) {
      return true;
    }

    if (error?.name === "AbortError") {
      return true;
    }

    return false;
  }

  /**
   * Handle chain changed event
   * @param chainId - The chain ID to handle
   * @dev Only emit the event, don't modify state in this method
   */
  protected _handleChainChanged(chainId: string) {
    if (!isValidChainId(chainId)) {
      return;
    }

    this.emit("chainChanged", chainId);
  }

  /**
   * Handle accounts changed event
   * @param newAddress - The new addresses
   */
  protected _handleAccountsChanged(newAddress: Address[]): void {
    this.emit("accountsChanged", newAddress);
  }
}
