import type { Auth0Config } from './types';

export function getLogoutUrl(config: Auth0Config, returnTo: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    returnTo,
  });
  return `https://${config.domain}/v2/logout?${params}`;
}
