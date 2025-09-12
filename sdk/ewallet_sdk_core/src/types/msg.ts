import type { ChainInfo } from "@keplr-wallet/types";
import type { Result } from "@keplr-ewallet/stdlib-js";

import type { OpenModalAckPayload, OpenModalPayload } from "./modal";
import type { InitPayload } from "./init";
import type { OAuthSignInError } from "./sign_in";

export type MsgTarget = "keplr_ewallet_attached" | "keplr_ewallet_sdk_core";

export type EWalletMsgGetPublicKey = {
  target: "keplr_ewallet_attached";
  msg_type: "get_public_key";
  payload: null;
};

export type EWalletMsgGetPublicKeyAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "get_public_key_ack";
  payload: Result<string, string>;
};

export type EWalletMsgSetOAuthNonce = {
  target: "keplr_ewallet_attached";
  msg_type: "set_oauth_nonce";
  payload: string;
};

export type EWalletMsgSetOAuthNonceAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "set_oauth_nonce_ack";
  payload: Result<null, string>;
};

export type EWalletMsgOAuthSignIn = {
  target: "keplr_ewallet_attached";
  msg_type: "oauth_sign_in";
  payload: {
    access_token: string;
    id_token: string;
    api_key: string;
    target_origin: string;
  };
};

export type EWalletMsgOAuthSignInAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "oauth_sign_in_ack";
  payload: Result<null, OAuthSignInError>;
};

export type EWalletMsgSignOut = {
  target: "keplr_ewallet_attached";
  msg_type: "sign_out";
  payload: null;
};

export type EWalletMsgSignOutAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "sign_out_ack";
  payload: Result<null, string>;
};

export type EWalletMsgOpenModal = {
  target: "keplr_ewallet_attached";
  msg_type: "open_modal";
  payload: OpenModalPayload;
};

export type EWalletMsgOpenModalAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "open_modal_ack";
  payload: OpenModalAckPayload;
};

export type EWalletMsgHideModal = {
  target: "keplr_ewallet_attached";
  msg_type: "hide_modal";
  payload: null;
};

export type EWalletMsgHideModalAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "hide_modal_ack";
  payload: Result<null, string>;
};

export type EWalletMsgInit = {
  target: "keplr_ewallet_attached";
  msg_type: "init";
  payload: Result<InitPayload, string>;
};

export type EWalletMsgInitAck = {
  target: "keplr_ewallet_sdk";
  msg_type: "init_ack";
  payload: Result<null, string>;
};

export type EWalletMsgGetEmail = {
  target: "keplr_ewallet_attached";
  msg_type: "get_email";
  payload: null;
};

export type EWalletMsgGetEmailAck = {
  target: "keplr_ewallet_sdk";
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
  target: "keplr_ewallet_sdk";
  msg_type: "get_cosmos_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type EWalletMsg =
  | EWalletMsgInit
  | EWalletMsgInitAck
  | EWalletMsgGetPublicKey
  | EWalletMsgGetPublicKeyAck
  | EWalletMsgSetOAuthNonce
  | EWalletMsgSetOAuthNonceAck
  | EWalletMsgOAuthSignIn
  | EWalletMsgOAuthSignInAck
  | EWalletMsgSignOut
  | EWalletMsgSignOutAck
  | EWalletMsgOpenModal
  | EWalletMsgOpenModalAck
  | EWalletMsgHideModal
  | EWalletMsgHideModalAck
  | EWalletMsgGetEmail
  | EWalletMsgGetEmailAck
  // TODO: @elden
  | EWalletMsgGetCosmosChainInfo
  | EWalletMsgGetCosmosChainInfoAck
  | {
    target: "keplr_ewallet_sdk";
    msg_type: "unknown_msg_type";
    payload: string | null;
  };
