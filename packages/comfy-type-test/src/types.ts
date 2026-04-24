export type ComfyRole =
  | 'anonymous_guest'
  | 'auth_customer_user'
  | 'auth_guest'
  | 'auth_payments_mgmt'
  | 'auth_mgmt';

export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
}
