export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  audience?: string;
  scope?: string;
  claimsNamespace: string;
  sessionCookieName?: string;
  sessionSecret: string;
}

export interface TokenResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface Session {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt: number;
  userId: string;
}

export interface AuthContext {
  session: Session;
  user: Record<string, unknown>;
}

export interface LoginUrlResult {
  url: string;
  codeVerifier: string;
  state: string;
}

export interface MinimalExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
