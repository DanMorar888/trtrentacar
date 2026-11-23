import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import type { Reservation } from "@/data/reservations";
import { formatDisplayDate } from "@/lib/format-date";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
const adminEmail = process.env.ADMIN_EMAIL || siteConfig.contact.email;

function reservationSummaryHtml(r: Reservation): string {
  return `
    ${r.reference ? `<p><strong>Nr. rezervare:</strong> ${r.reference}</p>` : ""}
    <p><strong>Mașină:</strong> ${r.carName}</p>
    <p><strong>Preluare:</strong> ${formatDisplayDate(r.pickupDate)} ${r.pickupTime} – ${r.pickupLocationName || r.pickupLocation}</p>
    <p><strong>Predare:</strong> ${formatDisplayDate(r.returnDate)} ${r.returnTime} – ${r.returnLocationName || r.returnLocation}</p>
    <p><strong>Nr. zile:</strong> ${r.days}</p>
    <p><strong>Total:</strong> ${r.total} €</p>
    <p><strong>Garanție:</strong> ${r.guarantee} €</p>
    <p><strong>Client:</strong> ${r.name}</p>
    <p><strong>Email:</strong> ${r.email}</p>
    <p><strong>Telefon:</strong> ${r.phone}</p>
    <p><strong>Plată:</strong> ${r.payment === "cash" ? "Cash la primire" : r.payment === "card_delivery" ? "Card la livrare" : "Transfer bancar"}</p>
    ${r.message ? `<p><strong>Mesaj:</strong> ${r.message}</p>` : ""}
  `.trim();
}

/** Trimite email client: am primit solicitarea. */
export async function sendClientRequestReceived(reservation: Reservation): Promise<boolean> {
  if (!resend) return false;
  const html = `
    <p>Bună ziua, ${reservation.name}!</p>
    <p>Am primit solicitarea ta de rezervare. Te vom contacta în scurt timp pentru confirmare.</p>
    <h3>Sumar rezervare</h3>
    ${reservationSummaryHtml(reservation)}
    <p>Cu stimă,<br/>${siteConfig.name}</p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.email,
    subject: `[TRT Rent a Car] Am primit solicitarea ta de rezervare`,
    html,
  });
  return !error;
}

/** Trimite email admin: solicitare nouă în așteptare. */
export async function sendAdminNewRequest(reservation: Reservation): Promise<boolean> {
  if (!resend) return false;
  const html = `
    <p>Ai o solicitare de rezervare în așteptare.</p>
    <h3>Sumar</h3>
    ${reservationSummaryHtml(reservation)}
    <p>Conectează-te la admin pentru a confirma sau anula: <a href="${siteConfig.url}/admin/rezervari">Rezervări</a></p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `[TRT Rent a Car] Solicitare rezervare nouă${reservation.reference ? ` – ${reservation.reference}` : ""} – ${reservation.carName} – ${reservation.name}`,
    html,
  });
  return !error;
}

/** Trimite email client: rezervare confirmată. */
export async function sendClientConfirmed(reservation: Reservation): Promise<boolean> {
  if (!resend) return false;
  const html = `
    <p>Bună ziua, ${reservation.name}!</p>
    <p>Rezervarea ta a fost <strong>confirmată</strong>.</p>
    <h3>Sumar</h3>
    ${reservationSummaryHtml(reservation)}
    <p>Te așteptăm! Cu stimă,<br/>${siteConfig.name}</p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.email,
    subject: `[TRT Rent a Car] Rezervare confirmată`,
    html,
  });
  return !error;
}

/** Trimite email client: rezervare anulată. */
export async function sendClientCancelled(reservation: Reservation): Promise<boolean> {
  if (!resend) return false;
  const html = `
    <p>Bună ziua, ${reservation.name}!</p>
    <p>Rezervarea ta a fost <strong>anulată</strong>.</p>
    <p>Dacă dorești o nouă rezervare, ne poți contacta oricând.</p>
    <p>Cu stimă,<br/>${siteConfig.name}</p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.email,
    subject: `[TRT Rent a Car] Rezervare anulată`,
    html,
  });
  return !error;
}

/** Trimite email admin: rezervare confirmată/anulată (notificare). */
export async function sendAdminStatusChange(reservation: Reservation): Promise<boolean> {
  if (!resend) return false;
  const statusLabel = reservation.status === "confirmed" ? "confirmată" : "anulată";
  const html = `
    <p>Rezervarea #${reservation.id} a fost ${statusLabel}.</p>
    <p><strong>Client:</strong> ${reservation.name} (${reservation.email})</p>
    <p><strong>Mașină:</strong> ${reservation.carName}, ${formatDisplayDate(reservation.pickupDate)} – ${formatDisplayDate(reservation.returnDate)}</p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `[TRT Rent a Car] Rezervare ${statusLabel}${reservation.reference ? ` – ${reservation.reference}` : ""} – ${reservation.name}`,
    html,
  });
  return !error;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendAdminContactMessage(payload: ContactPayload): Promise<boolean> {
  if (!resend) return false;
  const html = `
    <p>Ai un mesaj nou din formularul de contact.</p>
    <p><strong>Nume:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    ${payload.phone ? `<p><strong>Telefon:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
    <p><strong>Mesaj:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br/>")}</p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    replyTo: payload.email,
    subject: `[TRT Rent a Car] Mesaj contact – ${payload.name}`,
    html,
  });
  return !error;
}

export async function sendClientContactReceived(payload: ContactPayload): Promise<boolean> {
  if (!resend) return false;
  const html = `
    <p>Bună ziua, ${escapeHtml(payload.name)}!</p>
    <p>Am primit mesajul tău și îți vom răspunde în cel mai scurt timp.</p>
    <p><strong>Mesajul tău:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br/>")}</p>
    <p>Cu stimă,<br/>${siteConfig.name}</p>
  `;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: payload.email,
    subject: `[TRT Rent a Car] Am primit mesajul tău`,
    html,
  });
  return !error;
}
