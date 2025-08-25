import type {
  Address,
  AddEthereumChainParameter as Chain,
  RpcError,
  TypedDataDefinition,
} from "viem";
import {
  hexToString,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  isAddress,
  isAddressEqual,
  ProviderDisconnectedError,
  ChainDisconnectedError,
  ResourceUnavailableRpcError,
  serializeTypedData,
  UnsupportedChainIdError,
  UnsupportedProviderMethodError,
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
  toSignableTransaction,
  validateChain,
} from "@keplr-ewallet-sdk-eth/utils";
import type {
  EIP1193Provider,
  EWalletEIP1193ProviderOptions,
  ProviderConnectInfo,
  ChainWithStatus,
} from "@keplr-ewallet-sdk-eth/provider";
import { ProviderEventEmitter, VERSION } from "@keplr-ewallet-sdk-eth/provider";

export class EWalletEIP1193Provider
  extends ProviderEventEmitter
  implements EIP1193Provider
{
  protected isInitialized: boolean;

  protected signer: EthSigner | undefined;

  protected activeChain: Chain;
  protected addedChains: ChainWithStatus[];

  private lastConnectedEmittedEvent: "connect" | "disconnect" | null;

  public readonly isEWallet: true = true;
  public readonly version: string = VERSION;
  public readonly name: string = "EWalletEIP1193Provider";

  public ready: Promise<void> | null = null;

  constructor(options: EWalletEIP1193ProviderOptions) {
    super();

    this.isInitialized = false;
    this.lastConnectedEmittedEvent = null;

    this.addedChains = options.chains.map((chain) => ({
      ...chain,
      validationStatus: "pending",
      connected: false,
    }));

    this.activeChain = this.addedChains[0];

    this.ready = this._init(options);

    this.request = this.request.bind(this);
    this.on = this.on.bind(this);
    this.removeListener = this.removeListener.bind(this);
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
      const result = await this.handleRequest(args);

      if (this.activeChain) {
        this._handleConnected(true, { chainId: this.activeChain.chainId });
      }

      return result;
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
      return this.handlePublicRpcRequest(
        args as RpcRequestArgs<PublicRpcMethod>,
      );
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
        await this._validateActiveChain();

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

        let chainIdx = this.addedChains.findIndex(
          (c) => c.chainId === newChain.chainId,
        );
        let chain: ChainWithStatus;
        const isNew = chainIdx === -1;

        const wasActive =
          this.activeChain && this.activeChain.chainId === newChain.chainId;
        let original: ChainWithStatus | undefined = undefined;

        if (isNew) {
          chain = {
            ...newChain,
            validationStatus: "pending",
            connected: false,
          };
          this.addedChains.push(chain);
          chainIdx = this.addedChains.length - 1;
        } else {
          chain = this.addedChains[chainIdx];
          original = { ...chain };
          Object.assign(chain, newChain);
          chain.validationStatus = "pending";
          chain.connected = false;
        }

        let validationSucceeded = false;

        try {
          await this._manageChain(chain, true, true, false);
          validationSucceeded = true;
          chain.validationStatus = "valid";
          if (wasActive) chain.connected = true;
        } catch (err) {
          // remove new chain or restore original
          if (isNew) {
            this.addedChains.splice(chainIdx, 1);
          } else if (original) {
            Object.assign(chain, original);
            if (wasActive) this.activeChain = original;
          }
        }

        if (!validationSucceeded) {
          throw new InvalidParamsRpcError(
            new Error("Chain validation failed."),
          );
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
    await this._validateActiveChain();

    switch (args.method) {
      case "eth_accounts":
      case "eth_requestAccounts":
        this._handleConnected(true, { chainId: this.activeChain?.chainId });

        try {
          const { address } = this._getAuthenticatedSigner(args.method);
          return [address];
        } catch (error) {
          // ignore error as it's expected for `eth_accounts` and `eth_requestAccounts`
          // when no signer is provided or signer is not authenticated
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

        const signableTx = toSignableTransaction(tx);

        const { signer, address } = this._getAuthenticatedSigner(args.method);

        const result = await signer.sign({
          type: "sign_transaction",
          data: {
            address,
            transaction: signableTx,
          },
        });

        if (result.type !== "signed_transaction") {
          throw new Error("Invalid result type");
        }

        this._handleConnected(true, { chainId: this.activeChain?.chainId });

        return result.signedTransaction;
      }
      case "eth_signTypedData_v4": {
        const [signWith, rawTypedData] =
          args.params as RpcRequestArgs<"eth_signTypedData_v4">["params"];

        const { signer, address } = this._getAuthenticatedSigner(args.method);

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

        this._handleConnected(true, { chainId: this.activeChain?.chainId });

        return result.signature;
      }
      case "personal_sign": {
        const [message, signWith] =
          args.params as RpcRequestArgs<"personal_sign">["params"];

        const { signer, address } = this._getAuthenticatedSigner(args.method);

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

        this._handleConnected(true, { chainId: this.activeChain?.chainId });

        return result.signature;
      }
      default:
        throw new UnsupportedProviderMethodError(
          new Error("Method not supported"),
        );
    }
  }

  /**
   * Validate the active chain before making network requests
   */
  private async _validateActiveChain(): Promise<void> {
    if (!this.activeChain) {
      throw new InvalidRequestRpcError(new Error("Invalid request"));
    }

    const activeChainStatus = this.addedChains.find(
      (chain) => chain.chainId === this.activeChain.chainId,
    );

    if (activeChainStatus?.validationStatus !== "valid") {
      throw new InvalidRequestRpcError(new Error("Active chain is not valid."));
    }
  }

  private _getAuthenticatedSigner(calledMethod: WalletRpcMethod): {
    signer: EthSigner;
    address: Address;
  } {
    const signer = this.signer;

    if (!signer) {
      throw new UnsupportedProviderMethodError(
        new Error("Signer is required for wallet RPC methods"),
      );
    }

    const address = signer.getAddress();
    if (!address) {
      throw new UnsupportedProviderMethodError(
        new Error("No authenticated signer for wallet RPC methods"),
      );
    }
    return { signer, address };
  }

  /**
   * Internal method to manage a chain (validate, add, and optionally switch)
   * @param chain - The chain to manage
   * @param skipDuplicateCheck - Whether to skip checking for existing chains
   * @param validationOnly - If true, only validate the chain without adding it
   * @param shouldSwitch - Whether to switch to the managed chain (default: true)
   * @returns Promise that resolves when chain is managed/validated
   */
  private async _manageChain(
    chain: Chain,
    skipDuplicateCheck = false,
    validationOnly = false,
    shouldSwitch = true,
  ): Promise<void> {
    const chainsToCheck = validationOnly ? [] : this.addedChains;
    const result = validateChain(chain, chainsToCheck);
    if (!result.isValid) {
      throw new Error(result.error || "Chain validation failed");
    }

    const {
      rpcUrls: [rpcUrl],
    } = chain;

    if (!rpcUrl) {
      throw new Error("No RPC URL for the chain");
    }

    const requestBody = {
      method: "eth_chainId",
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

    const data = await res.json();

    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }

    const rpcChainId = data.result;

    if (rpcChainId !== chain.chainId) {
      throw new Error(
        `Chain ID mismatch: expected ${chain.chainId}, got ${rpcChainId}`,
      );
    }

    if (validationOnly) {
      const existingChain = this.addedChains.find(
        (c) => c.chainId === chain.chainId,
      );

      if (existingChain) {
        existingChain.validationStatus = "valid";
      }

      return;
    }

    const prevActiveChain = this.activeChain;

    if (shouldSwitch) {
      this.activeChain = chain;
    }

    try {
      if (!skipDuplicateCheck) {
        const existingChain = this.addedChains.find(
          (c) => c.chainId === chain.chainId,
        );
        if (!existingChain) {
          this.addedChains.push({
            ...chain,
            connected: false,
            validationStatus: "valid",
          });
        } else {
          existingChain.validationStatus = "valid";
        }
      }

      const prevChainId = prevActiveChain?.chainId;
      if (shouldSwitch && prevChainId !== rpcChainId && this.isInitialized) {
        this._handleChainChanged(rpcChainId);
        this._handleConnected(true, { chainId: rpcChainId });
      }
    } catch (error) {
      // Only restore previous chain if shouldSwitch is true
      if (shouldSwitch) {
        this.activeChain = prevActiveChain;
      }
      throw error;
    }
  }

  /**
   * Initialize the provider asynchronously
   * @param options - The options to initialize the provider
   * @returns Promise that resolves when the provider is initialized
   */
  protected async _init(options: EWalletEIP1193ProviderOptions): Promise<void> {
    const { signer } = options;

    // signer may not have address at this point as it's not authenticated yet
    let signerAddresses: Address[] = [];

    if (signer) {
      try {
        const signerAddress = signer.getAddress();
        if (!signerAddress || !isAddress(signerAddress)) {
          throw new Error("Invalid signer address");
        }

        if (typeof signer.sign !== "function") {
          throw new Error("Invalid signer");
        }

        signerAddresses = [signerAddress];
      } catch (error) {
        signerAddresses = [];
      }

      this.signer = signer;
    }

    if (options.skipChainValidation) {
      this.addedChains.forEach((chain, idx) => {
        chain.validationStatus = "valid";
        chain.connected = idx === 0;
      });

      this.activeChain = this.addedChains[0];

      this.isInitialized = true;
      this.emit<any>("_initialized", {});

      this._handleChainChanged(this.activeChain.chainId);
      this._handleConnected(true, { chainId: this.activeChain.chainId });
      if (signerAddresses.length > 0) {
        this._handleAccountsChanged(signerAddresses);
      }
      return;
    }

    await Promise.all(
      this.addedChains.map(async (chain) => {
        try {
          await this._manageChain(chain, true, true, false);
        } catch (err) {
          chain.validationStatus = "invalid";
          chain.connected = false;
        }
      }),
    );

    const firstValid = this.addedChains.find(
      (c) => c.validationStatus === "valid",
    );
    if (firstValid) {
      this.activeChain = firstValid;
      this.isInitialized = true;

      this.emit<any>("_initialized", {});

      this._handleChainChanged(this.activeChain.chainId);
      this._handleConnected(true, { chainId: this.activeChain.chainId });
      if (signerAddresses.length > 0) {
        this._handleAccountsChanged(signerAddresses);
      }
    } else {
      throw new Error("No valid chains found during provider initialization");
    }
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
    if (!this.isInitialized) {
      return;
    }

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

    if (this.isInitialized) {
      this.emit("chainChanged", chainId);
    }
  }

  /**
   * Handle accounts changed event
   * @param newAddress - The new addresses
   */
  protected _handleAccountsChanged(newAddress: Address[]): void {
    this.emit("accountsChanged", newAddress);
  }
}

export async function initEWalletEIP1193Provider(
  options: EWalletEIP1193ProviderOptions,
): Promise<EWalletEIP1193Provider> {
  const provider = new EWalletEIP1193Provider(options);
  await provider.ready;
  return provider;
}
