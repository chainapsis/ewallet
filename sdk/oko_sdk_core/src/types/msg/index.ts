import type { ChainInfo } from "@keplr-wallet/types";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OpenModalAckPayload,
  OpenModalPayload,
} from "@oko-wallet-sdk-core/types/modal";
import type { InitPayload } from "@oko-wallet-sdk-core/types/init";
import type { OAuthSignInError } from "@oko-wallet-sdk-core/types/sign_in";
import type { OAuthPayload } from "@oko-wallet-sdk-core/types/oauth";

export type EWalletMsgGetPublicKey = {
  target: "keplr_ewallet_attached";
  msg_type: "get_public_key";
  payload: null;
};

export type EWalletMsgGetPublicKeyAck = {
  target: "keplr_oko_sdk";
  msg_type: "get_public_key_ack";
  payload: Result<string, string>;
};

export type EWalletMsgSetOAuthNonce = {
  target: "keplr_ewallet_attached";
  msg_type: "set_oauth_nonce";
  payload: string;
};

export type EWalletMsgSetOAuthNonceAck = {
  target: "keplr_oko_sdk";
  msg_type: "set_oauth_nonce_ack";
  payload: Result<null, string>;
};

export type EWalletMsgOAuthSignInUpdate = {
  target: "keplr_oko_sdk";
  msg_type: "oauth_sign_in_update";
  payload: Result<null, OAuthSignInError>;
};

export type EWalletMsgOAuthSignInUpdateAck = {
  target: "keplr_ewallet_attached";
  msg_type: "oauth_sign_in_update_ack";
  payload: null;
};

export type EWalletMsgOAuthInfoPass = {
  target: "keplr_ewallet_attached";
  msg_type: "oauth_info_pass";
  payload: OAuthPayload;
};

export type EWalletMsgOAuthInfoPassAck = {
  target: "keplr_ewallet_attached_popup";
  msg_type: "oauth_info_pass_ack";
  payload: null;
};

export type EWalletMsgSignOut = {
  target: "keplr_ewallet_attached";
  msg_type: "sign_out";
  payload: null;
};

export type EWalletMsgSignOutAck = {
  target: "keplr_oko_sdk";
  msg_type: "sign_out_ack";
  payload: Result<null, string>;
};

export type EWalletMsgOpenModal = {
  target: "keplr_ewallet_attached";
  msg_type: "open_modal";
  payload: OpenModalPayload;
};

export type EWalletMsgOpenModalAck = {
  target: "keplr_oko_sdk";
  msg_type: "open_modal_ack";
  payload: OpenModalAckPayload;
};

export type EWalletMsgHideModal = {
  target: "keplr_ewallet_attached";
  msg_type: "hide_modal";
  payload: null;
};

export type EWalletMsgHideModalAck = {
  target: "keplr_oko_sdk";
  msg_type: "hide_modal_ack";
  payload: Result<null, string>;
};

export type EWalletMsgInit = {
  target: "keplr_oko_sdk";
  msg_type: "init";
  payload: Result<InitPayload, string>;
};

export type EWalletMsgInitAck = {
  target: "keplr_ewallet_attached";
  msg_type: "init_ack";
  payload: Result<null, string>;
};

export type EWalletMsgGetEmail = {
  target: "keplr_ewallet_attached";
  msg_type: "get_email";
  payload: null;
};

export type EWalletMsgGetEmailAck = {
  target: "keplr_oko_sdk";
  msg_type: "get_email_ack";
  payload: Result<string, string>;
};

export type EWalletMsgGetCosmosChainInfo = {
  target: "keplr_ewallet_attached";
  msg_type: "get_cosmos_chain_info";
  payload: {
    chain_id: string | null;
  };
};

export type EWalletMsgGetCosmosChainInfoAck = {
  target: "keplr_oko_sdk";
  msg_type: "get_cosmos_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type EWalletMsgGetEthChainInfo = {
  target: "keplr_ewallet_attached";
  msg_type: "get_eth_chain_info";
  payload: {
    chain_id: string | null;
  };
};

export type EWalletMsgGetEthChainInfoAck = {
  target: "keplr_oko_sdk";
  msg_type: "get_eth_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type EWalletMsg =
  | EWalletMsgInit
  | EWalletMsgInitAck
  | EWalletMsgGetPublicKey
  | EWalletMsgGetPublicKeyAck
  | EWalletMsgSetOAuthNonce
  | EWalletMsgSetOAuthNonceAck
  | EWalletMsgOAuthSignInUpdate
  | EWalletMsgOAuthSignInUpdateAck
  | EWalletMsgOAuthInfoPass
  | EWalletMsgOAuthInfoPassAck
  | EWalletMsgSignOut
  | EWalletMsgSignOutAck
  | EWalletMsgOpenModal
  | EWalletMsgOpenModalAck
  | EWalletMsgHideModal
  | EWalletMsgHideModalAck
  | EWalletMsgGetEmail
  | EWalletMsgGetEmailAck
  | EWalletMsgGetCosmosChainInfo
  | EWalletMsgGetCosmosChainInfoAck
  | EWalletMsgGetEthChainInfo
  | EWalletMsgGetEthChainInfoAck
  | {
      target: "keplr_oko_sdk";
      msg_type: "unknown_msg_type";
      payload: string | null;
    };
