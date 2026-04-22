import type { DecodedJwt, JwtHeader, JwtPayload } from './types';

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  return atob(pad ? padded + '='.repeat(4 - pad) : padded);
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 parts');
  return {
    header: JSON.parse(base64UrlDecode(parts[0])) as JwtHeader,
    payload: JSON.parse(base64UrlDecode(parts[1])) as JwtPayload,
  };
}

export function isTokenExpired(payload: JwtPayload, clockSkewSeconds = 0): boolean {
  if (payload.exp === undefined) return false;
  return Date.now() / 1000 > payload.exp + clockSkewSeconds;
}

export function extractBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
