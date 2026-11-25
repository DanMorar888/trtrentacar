/** Credențiale de login în panou. Se setează în variabilele de mediu, nu în cod. */
export const ADMIN_LOGIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || "").trim().toLowerCase();

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export type AdminRole = "full" | "limited";

type AdminAccount = {
  email: string;
  password: string;
  role: AdminRole;
};

function accountFromEnv(
  email: string | undefined,
  password: string | undefined,
  role: AdminRole
): AdminAccount | null {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedPassword = password || "";
  if (!normalizedEmail || !normalizedPassword) return null;
  return { email: normalizedEmail, password: normalizedPassword, role };
}

/** Contul principal are drepturi complete. Contul secundar nu poate adăuga sau șterge mașini. */
export function getAdminAccounts(): AdminAccount[] {
  return [
    accountFromEnv(process.env.ADMIN_LOGIN_EMAIL, process.env.ADMIN_PASSWORD, "full"),
    accountFromEnv(process.env.ADMIN_LOGIN_EMAIL_2, process.env.ADMIN_PASSWORD_2, "limited"),
  ].filter((account): account is AdminAccount => account !== null);
}

function sameSecret(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export function matchAdminLogin(email: string, password: string): AdminRole | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;
  const account = getAdminAccounts().find(
    (candidate) => candidate.email === normalizedEmail && sameSecret(candidate.password, password)
  );
  return account?.role ?? null;
}

export function isAdminLogin(email: string, password: string): boolean {
  return matchAdminLogin(email, password) !== null;
}
