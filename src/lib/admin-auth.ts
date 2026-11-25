import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_PASSWORD, type AdminRole } from "@/lib/admin-credentials";

const COOKIE_NAME = "admin_session";
const ROLE_COOKIE_NAME = "admin_role";
const SALT = "888rentacar-admin";

function tokenFor(role: AdminRole): string {
  const message = role === "limited" ? `${SALT}:limited` : SALT;
  return createHmac("sha256", ADMIN_PASSWORD).update(message).digest("hex");
}

function sameToken(token: string, expected: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function getAdminToken(role: AdminRole = "full"): string {
  return tokenFor(role);
}

export function getAdminRole(token: string | null): AdminRole | null {
  if (!token) return null;
  if (sameToken(token, tokenFor("full"))) return "full";
  if (sameToken(token, tokenFor("limited"))) return "limited";
  return null;
}

export function verifyAdminToken(token: string | null): boolean {
  return getAdminRole(token) !== null;
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function getRoleCookieName(): string {
  return ROLE_COOKIE_NAME;
}
