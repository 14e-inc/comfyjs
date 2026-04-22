# AGENTS.md — comfyjs Monorepo

Guidance for AI agents and contributors working in this repository.

---

## Repository Overview

This is a **pnpm workspaces monorepo** under the `@14e-inc` GitHub Packages scope. All packages are published to `https://npm.pkg.github.com` using the auth token in `.npmrc`.

### Packages

| Package | Path | Purpose |
|---|---|---|
| `@14e-inc/comfyjs` | `/` (root) | General JS utility library (Logger, etc.) |
| `@14e-inc/comfy-auth-util` | `packages/comfy-auth-util/` | Low-level JWT decode + claims helpers (no external deps) |
| `@14e-inc/comfy-auth` | `packages/comfy-auth/` | Auth0 OAuth flow + JWT verification for Cloudflare Workers |

---

## Architecture Decision: Root-plus-packages Monorepo

**Decision:** The root of this repo remains the publishable `@14e-inc/comfyjs` package. New packages live under `packages/`. This deviates from the conventional "private root" monorepo structure.

**Why:** Avoids a disruptive file migration for the existing package. The pnpm workspace (`pnpm-workspace.yaml`) only indexes `packages/*`, so the root continues to build and publish independently via `pnpm publish` at the repo root.

**Trade-off:** The root `package.json` carries both workspace scripts (`build:all`, `test:all`) and its own publishing config. Keep these clearly separated — workspace-level scripts are prefixed with `:all`.

---

## Target Platform

Both auth packages target **Cloudflare Workers** (edge runtime). This drives several constraints:

- **No Node.js built-ins** (`fs`, `crypto`, `Buffer`, etc.) — all crypto uses `globalThis.crypto` (Web Crypto API).
- **No `jsonwebtoken`** — uses [`jose`](https://github.com/panva/jose) which is Web Crypto compatible.
- **`atob` / `btoa`** are available globally in CF Workers — used for base64 operations.
- **`fetch`** is the global HTTP client — no `node-fetch` or `axios`.
- TypeScript target is `ES2022`, lib includes `DOM` for Web API types.
- Dev types come from `@cloudflare/workers-types`.

---

## Package: `@14e-inc/comfy-auth-util`

Zero-dependency utility library. Safe to use anywhere (Node, browser, edge).

### Exports

```typescript
// Types
ComfyRole         // union: 'anonymous_guest' | 'auth_customer_user' | 'auth_guest' | 'auth_payments_mgmt' | 'auth_mgmt'
JwtPayload        // standard JWT claims + index signature
JwtHeader
DecodedJwt

// JWT
decodeJwt(token: string): DecodedJwt
isTokenExpired(payload: JwtPayload, clockSkewSeconds?: number): boolean
extractBearerToken(request: Request): string | null

// Claims — all require (payload, claimsNamespace)
getRoles(payload, claimsNamespace): ComfyRole[]
hasRole(payload, role, claimsNamespace): boolean
hasAnyRole(payload, roles[], claimsNamespace): boolean
hasAllRoles(payload, roles[], claimsNamespace): boolean
isAnonymousGuest(payload, claimsNamespace): boolean
isAuthenticatedUser(payload, claimsNamespace): boolean
canManagePayments(payload, claimsNamespace): boolean
isAdmin(payload, claimsNamespace): boolean
```

### Claims Namespace

Auth0 requires custom claims to be namespaced with a URL to avoid collisions. The namespace is passed explicitly to every claims function. It should be stored in your app config and match what you configured in your Auth0 Actions/Rules.

Example: if your Auth0 Action sets `event.accessToken.setCustomClaim('https://myapp.com/roles', ['auth_customer_user'])`, then `claimsNamespace` is `'https://myapp.com'` and the library will look up `https://myapp.com/roles`.

---

## Package: `@14e-inc/comfy-auth`

Auth0 OAuth 2.0 + OIDC library for Cloudflare Workers backends. Depends on `jose` and `@14e-inc/comfy-auth-util`.

### Auth Flow (Authorization Code + PKCE)

This is the recommended flow for web apps where the CF Worker acts as a backend-for-frontend (BFF):

```
Browser                 CF Worker               Auth0
  |                         |                     |
  |-- GET /auth/login ------>|                     |
  |                         |-- getLoginUrl() ---->|
  |<-- 302 to Auth0 --------|                     |
  |                                               |
  |-- authenticates with Auth0 ------------------>|
  |<-- 302 to /auth/callback with ?code= ---------|
  |                                               |
  |-- GET /auth/callback?code=... -------------->  |
  |                         |-- exchangeCodeForTokens() --> Auth0
  |                         |<-- tokens --------- |
  |                         |-- verifyJwt() (JWKS)|
  |                         |-- createSessionCookie()      |
  |<-- 302 to app + Set-Cookie ------------------|
  |                         |                     |
  |-- GET /api/... (with cookie) --------------->  |
  |                         |-- withAuth() middleware      |
  |<-- API response --------|                     |
```

### CF Worker Route Example

```typescript
import {
  getLoginUrl, exchangeCodeForTokens, buildSession,
  verifyJwt, createSessionCookie, clearSessionCookie,
  getLogoutUrl, withAuth, parseReturnTo
} from '@14e-inc/comfy-auth';
import { hasRole } from '@14e-inc/comfy-auth-util';

const config = {
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  redirectUri: 'https://myapp.workers.dev/auth/callback',
  audience: env.AUTH0_AUDIENCE,
  claimsNamespace: 'https://myapp.com',
  sessionSecret: env.SESSION_SECRET,   // 32+ char random string
};

// /auth/login
async function handleLogin(request: Request, env: Env) {
  const { url, codeVerifier, state } = await getLoginUrl(config, '/dashboard');
  const res = new Response(null, { status: 302, headers: { Location: url } });
  // Store codeVerifier for callback — use a short-lived cookie or KV
  res.headers.append('Set-Cookie', `pkce_verifier=${codeVerifier}; HttpOnly; Secure; SameSite=Lax; Max-Age=300`);
  return res;
}

// /auth/callback
async function handleCallback(request: Request, env: Env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code')!;
  const state = url.searchParams.get('state')!;
  const codeVerifier = /* read from pkce_verifier cookie */;

  const tokens = await exchangeCodeForTokens(code, codeVerifier, config);
  const payload = await verifyJwt(tokens.access_token, config);
  const session = buildSession(tokens, String(payload.sub));

  const returnTo = parseReturnTo(state) ?? '/';
  const res = new Response(null, { status: 302, headers: { Location: returnTo } });
  res.headers.append('Set-Cookie', await createSessionCookie(session, config.sessionSecret));
  res.headers.append('Set-Cookie', 'pkce_verifier=; Max-Age=0; Path=/');
  return res;
}

// Protected API route
const protectedHandler = withAuth(
  async (request, env, ctx, auth) => {
    if (!hasRole(auth.user, 'auth_customer_user', config.claimsNamespace)) {
      return new Response('Forbidden', { status: 403 });
    }
    return new Response(JSON.stringify({ userId: auth.session.userId }));
  },
  config
);
```

### API Reference

```typescript
// PKCE helpers
generateCodeVerifier(): string
generateCodeChallenge(verifier: string): Promise<string>

// Login
getLoginUrl(config, returnTo?: string): Promise<LoginUrlResult>
parseReturnTo(state: string): string | null

// Callback / token exchange
exchangeCodeForTokens(code, codeVerifier, config): Promise<TokenResponse>
buildSession(tokens: TokenResponse, userId: string): Session
refreshAccessToken(refreshToken, config): Promise<TokenResponse>

// Verification
verifyJwt(token, config): Promise<JWTPayload>   // throws on invalid/expired

// Session (HMAC-signed cookies, Web Crypto)
createSessionCookie(session, secret, cookieName?, secure?): Promise<string>
getSessionFromRequest(request, secret, cookieName?): Promise<Session | null>
clearSessionCookie(cookieName?): string

// Logout
getLogoutUrl(config, returnTo: string): string

// Middleware
withAuth(handler, config, options?): CF Workers handler
```

### Session Cookie Security

Sessions are serialized as base64 JSON and HMAC-SHA256 signed using `crypto.subtle`. The `sessionSecret` must be a strong random string (32+ characters). Cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` by default.

The session is **not encrypted** (only signed). Do not store sensitive data beyond what is needed (accessToken, userId, expiresAt). For sensitive payloads, add AES-GCM encryption on top of `session.ts`.

---

## Custom Claims / Roles

Roles are stored in a custom claim at `{claimsNamespace}/roles` as a string array. Configure this in an **Auth0 Action** on the token exchange event:

```javascript
// Auth0 Action: Add roles to access token
exports.onExecuteCredentialsExchange = async (event, api) => {
  const roles = getUserRoles(event.user.user_id); // your logic
  api.accessToken.setCustomClaim('https://myapp.com/roles', roles);
};
```

### Role Hierarchy

| Role | Description |
|---|---|
| `anonymous_guest` | Unauthenticated / pre-login user |
| `auth_guest` | Authenticated but limited access |
| `auth_customer_user` | Standard authenticated customer |
| `auth_payments_mgmt` | Can manage payment operations |
| `auth_mgmt` | Full admin access |

Use `isAdmin()`, `canManagePayments()`, `isAuthenticatedUser()`, `isAnonymousGuest()` for semantic checks rather than raw `hasRole()` where possible.

---

## Building & Publishing

### Install all packages
```bash
pnpm install
```

### Build all packages
```bash
pnpm build:all
# or per-package:
cd packages/comfy-auth && pnpm build
```

### Publish a package
```bash
cd packages/comfy-auth
pnpm publish --access restricted
```

The `.npmrc` at the repo root configures the `@14e-inc` scope to use GitHub Packages. The `ghp_*` token must have `write:packages` permission on `github.com/hebronwatson/comfyjs`.

### Publish all packages from root
```bash
pnpm publish:all
```

---

## Testing

Both auth packages use **Vitest** (not Jest). The root `comfyjs` package uses Jest — do not mix test runners.

```bash
cd packages/comfy-auth-util && pnpm test
cd packages/comfy-auth && pnpm test
```

CF Workers globals (`crypto`, `fetch`, `Request`, `Response`) are available in Vitest via the `@cloudflare/vitest-pool-workers` pool or by using `environment: 'miniflare'` in `vitest.config.ts`.

---

## Adding a New Package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `rollup.config.js`, `src/index.ts`.
2. Set `"name": "@14e-inc/<name>"` and `"publishConfig": { "registry": "https://npm.pkg.github.com" }`.
3. The workspace picks it up automatically via `pnpm-workspace.yaml`.
4. Reference sibling packages with `"workspace:*"` in `dependencies`.
