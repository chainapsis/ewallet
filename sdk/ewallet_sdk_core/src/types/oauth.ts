export type OAuthState = {
  apiKey: string;
  targetOrigin: string;
};

export enum RedirectUriSearchParamsKey {
  STATE = "state",
}

export interface OAuthResultPayload {
  access_token: string;
  id_token: string;
  api_key: string;
  target_origin: string;
}
