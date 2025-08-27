export type OAuthState = {
  apiKey: string;
  targetOrigin: string;
};

export enum RedirectUriSearchParamsKey {
  STATE = "state",
}
