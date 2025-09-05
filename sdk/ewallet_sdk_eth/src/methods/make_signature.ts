import type {
  EWalletMsgOpenModal,
  MakeEthereumSigData,
  ChainInfoForAttachedModal,
} from "@keplr-ewallet/ewallet-sdk-core";
import { v4 as uuidv4 } from "uuid";
import {
  InternalRpcError,
  UnsupportedChainIdError,
  UserRejectedRequestError,
  type Chain,
} from "viem";

import type {
  EthEWalletInterface,
  EthSignParams,
  EthSignResult,
  MakeSignatureBasePayload,
} from "@keplr-ewallet-sdk-eth/types";
import {
  getChainIconUrl,
  SUPPORTED_CHAINS,
  TESTNET_CHAINS,
} from "@keplr-ewallet-sdk-eth/chains";
import { toSignableTransaction } from "@keplr-ewallet-sdk-eth/utils";

export async function makeSignature(
  this: EthEWalletInterface,
  params: EthSignParams,
): Promise<EthSignResult> {
  await this.waitUntilInitialized;

  const origin = this.eWallet.origin;

  const provider = this.getEthereumProvider();
  const chainId = provider.chainId;
  const chainIdNumber = parseInt(chainId, 16);

  let chains: Chain[] = SUPPORTED_CHAINS;
  if (this.useTestnet) {
    chains = [...chains, ...TESTNET_CHAINS];
  }

  const activeChain = chains.find((chain) => chain.id === chainIdNumber);
  if (!activeChain) {
    throw new UnsupportedChainIdError(
      new Error("Chain not found in the supported chains"),
    );
  }

  const chainInfo: ChainInfoForAttachedModal = {
    chain_id: `eip155:${activeChain.id}`,
    chain_name: activeChain.name,
    chain_symbol_image_url: getChainIconUrl(activeChain.id),
    rpc_url: activeChain.rpcUrls.default.http[0],
    block_explorer_url: activeChain.blockExplorers?.default.url,
  };

  const basePayload = {
    chain_info: chainInfo,
    origin,
    signer: params.data.address,
  };

  const makeSignatureData = createMakeSignatureData(basePayload, params);

  const signResult = await handleSigningFlow(this, makeSignatureData);

  return signResult;
}

function createMakeSignatureData(
  basePayload: MakeSignatureBasePayload,
  params: EthSignParams,
): MakeEthereumSigData {
  switch (params.type) {
    case "sign_transaction": {
      return {
        chain_type: "eth",
        sign_type: "tx",
        payload: {
          ...basePayload,
          data: {
            transaction: toSignableTransaction(params.data.transaction),
          },
        },
      };
    }

    case "personal_sign": {
      return {
        chain_type: "eth",
        sign_type: "arbitrary",
        payload: {
          ...basePayload,
          data: {
            message: params.data.message,
          },
        },
      };
    }

    case "sign_typedData_v4": {
      return {
        chain_type: "eth",
        sign_type: "eip712",
        payload: {
          ...basePayload,
          data: {
            version: "4",
            serialized_typed_data: params.data.serializedTypedData,
          },
        },
      };
    }

    default: {
      throw new InternalRpcError(
        new Error(`Unknown sign method: ${(params as any).type}`),
      );
    }
  }
}

async function handleSigningFlow(
  ethEWallet: EthEWalletInterface,
  data: MakeEthereumSigData,
): Promise<EthSignResult> {
  const eWallet = ethEWallet.eWallet;

  try {
    const modal_id = uuidv4();

    const openModalMsg: EWalletMsgOpenModal = {
      target: "keplr_ewallet_attached",
      msg_type: "open_modal",
      payload: {
        modal_type: "make_signature",
        modal_id,
        data,
      },
    };

    const openModalResp = await eWallet.openModal(openModalMsg);

    if (openModalResp.modal_type !== "make_signature") {
      throw new Error("Invalid modal type response");
    }

    switch (openModalResp.type) {
      case "approve": {
        if (openModalResp.data.chain_type !== "eth") {
          throw new Error("Invalid chain type sig response");
        }

        const makeEthereumSigResult = openModalResp.data;

        return makeEthereumSigResult.sig_result;
      }

      case "reject": {
        throw new UserRejectedRequestError(
          new Error("User rejected the signature request"),
        );
      }

      case "error": {
        throw new Error(openModalResp.error);
      }

      default: {
        throw new Error("unreachable");
      }
    }
  } catch (error) {
    // if it's already a JSON-RPC compatible error, just throw it
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    throw new InternalRpcError(
      new Error(error instanceof Error ? error.message : String(error)),
    );
  } finally {
    eWallet.closeModal();
  }
}
