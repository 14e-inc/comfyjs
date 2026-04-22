import type { ComfyRole, JwtPayload } from './types';

export function getRoles(payload: JwtPayload, claimsNamespace: string): ComfyRole[] {
  const raw = payload[`${claimsNamespace}/roles`];
  return Array.isArray(raw) ? (raw as ComfyRole[]) : [];
}

export function hasRole(payload: JwtPayload, role: ComfyRole, claimsNamespace: string): boolean {
  return getRoles(payload, claimsNamespace).includes(role);
}

export function hasAnyRole(payload: JwtPayload, roles: ComfyRole[], claimsNamespace: string): boolean {
  const userRoles = getRoles(payload, claimsNamespace);
  return roles.some(r => userRoles.includes(r));
}

export function hasAllRoles(payload: JwtPayload, roles: ComfyRole[], claimsNamespace: string): boolean {
  const userRoles = getRoles(payload, claimsNamespace);
  return roles.every(r => userRoles.includes(r));
}

export function isAnonymousGuest(payload: JwtPayload, claimsNamespace: string): boolean {
  return hasRole(payload, 'anonymous_guest', claimsNamespace);
}

export function isAuthenticatedUser(payload: JwtPayload, claimsNamespace: string): boolean {
  return hasAnyRole(
    payload,
    ['auth_customer_user', 'auth_guest', 'auth_payments_mgmt', 'auth_mgmt'],
    claimsNamespace
  );
}

export function canManagePayments(payload: JwtPayload, claimsNamespace: string): boolean {
  return hasAnyRole(payload, ['auth_payments_mgmt', 'auth_mgmt'], claimsNamespace);
}

export function isAdmin(payload: JwtPayload, claimsNamespace: string): boolean {
  return hasRole(payload, 'auth_mgmt', claimsNamespace);
}
