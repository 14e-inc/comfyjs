import type { Session } from './types';

const DEFAULT_COOKIE = 'comfy_session';

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return `${value}.${base64UrlEncode(new Uint8Array(sig))}`;
}

async function verifyAndExtract(signed: string, secret: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return null;

  const value = signed.slice(0, lastDot);
  const expectedSig = signed.slice(lastDot + 1);

  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  const actualSig = base64UrlEncode(new Uint8Array(sig));

  return expectedSig === actualSig ? value : null;
}

export async function createSessionCookie(
  session: Session,
  secret: string,
  cookieName = DEFAULT_COOKIE,
  secure = true
): Promise<string> {
  const payload = btoa(JSON.stringify(session));
  const signed = await sign(payload, secret);
  const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000);
  const flags = [`Max-Age=${maxAge}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', secure ? 'Secure' : '']
    .filter(Boolean)
    .join('; ');
  return `${cookieName}=${encodeURIComponent(signed)}; ${flags}`;
}

export async function getSessionFromRequest(
  request: Request,
  secret: string,
  cookieName = DEFAULT_COOKIE
): Promise<Session | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const eq = c.trim().indexOf('=');
      return [c.trim().slice(0, eq), c.trim().slice(eq + 1)];
    })
  );

  const raw = cookies[cookieName];
  if (!raw) return null;

  const value = await verifyAndExtract(decodeURIComponent(raw), secret);
  if (!value) return null;

  try {
    const session = JSON.parse(atob(value)) as Session;
    if (session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearSessionCookie(cookieName = DEFAULT_COOKIE): string {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
