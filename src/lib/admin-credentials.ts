/** Credențiale de login în panou. Se setează în variabilele de mediu, nu în cod. */
export const ADMIN_LOGIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || "").trim().toLowerCase();

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
