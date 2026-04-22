import type { Auth0Config, LoginUrlResult } from './types';
import { generateCodeVerifier, generateCodeChallenge, generateNonce } from './pkce';

export async function getLoginUrl(
  config: Auth0Config,
  returnTo?: string
): Promise<LoginUrlResult> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const nonce = generateNonce();
  const state = returnTo
    ? btoa(JSON.stringify({ nonce, returnTo }))
    : nonce;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope ?? 'openid profile email offline_access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  if (config.audience) params.set('audience', config.audience);

  return {
    url: `https://${config.domain}/authorize?${params}`,
    codeVerifier,
    state,
  };
}

export function parseReturnTo(state: string): string | null {
  try {
    const parsed = JSON.parse(atob(state)) as { returnTo?: string };
    return parsed.returnTo ?? null;
  } catch {
    return null;
  }
}
