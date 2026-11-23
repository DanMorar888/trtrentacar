import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_PASSWORD } from "@/lib/admin-credentials";

const COOKIE_NAME = "admin_session";
const SALT = "888rentacar-admin";

export function getAdminToken(): string {
  return createHmac("sha256", ADMIN_PASSWORD).update(SALT).digest("hex");
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const expected = getAdminToken();
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function getCookieName(): string {
  return COOKIE_NAME;
}
