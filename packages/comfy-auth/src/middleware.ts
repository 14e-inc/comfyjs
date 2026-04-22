import { extractBearerToken, decodeJwt } from '@14e-inc/comfy-auth-util';
import { verifyJwt } from './verify';
import { getSessionFromRequest } from './session';
import type { Auth0Config, AuthContext, Session, MinimalExecutionContext } from './types';

export type AuthHandler<Env = unknown> = (
  request: Request,
  env: Env,
  ctx: MinimalExecutionContext,
  auth: AuthContext
) => Response | Promise<Response>;

export interface WithAuthOptions {
  onUnauthorized?: (request: Request) => Response | Promise<Response>;
  cookieName?: string;
}

const defaultUnauthorized = (): Response =>
  new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });

export function withAuth<Env = unknown>(
  handler: AuthHandler<Env>,
  config: Auth0Config,
  options: WithAuthOptions = {}
) {
  const { onUnauthorized = defaultUnauthorized, cookieName } = options;

  return async (request: Request, env: Env, ctx: MinimalExecutionContext): Promise<Response> => {
    let token: string | null = null;
    let session: Session | null = null;

    const bearerToken = extractBearerToken(request);
    if (bearerToken) {
      token = bearerToken;
    } else {
      session = await getSessionFromRequest(request, config.sessionSecret, cookieName);
      token = session?.accessToken ?? null;
    }

    if (!token) return onUnauthorized(request);

    try {
      const payload = await verifyJwt(token, config);

      if (!session) {
        const { payload: decoded } = decodeJwt(token);
        session = {
          accessToken: token,
          expiresAt: (decoded.exp ?? 0) * 1000,
          userId: String(payload.sub ?? ''),
        };
      }

      return handler(request, env, ctx, {
        session,
        user: payload as Record<string, unknown>,
      });
    } catch {
      return onUnauthorized(request);
    }
  };
}
