import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import type { Auth0Config } from './types';

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(domain: string): ReturnType<typeof createRemoteJWKSet> {
  if (!jwksCache.has(domain)) {
    jwksCache.set(
      domain,
      createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`))
    );
  }
  return jwksCache.get(domain)!;
}

export async function verifyJwt(token: string, config: Auth0Config): Promise<JWTPayload> {
  const jwks = getJwks(config.domain);
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://${config.domain}/`,
    audience: config.audience,
  });
  return payload;
}

export type { JWTPayload };
