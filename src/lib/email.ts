import nodemailer from "nodemailer";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import type { Reservation } from "@/data/reservations";
import { formatDisplayDate } from "@/lib/format-date";

/** SMTP (căsuța de email de pe hosting) are prioritate; Resend rămâne ca alternativă. */
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtp = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;
const resend = !smtp && process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || "onboarding@resend.dev";
const fromAddress = `${siteConfig.name} <${fromEmail}>`;

type OutgoingEmail = { to: string | string[]; subject: string; html: string; replyTo?: string };

async function sendEmail(email: OutgoingEmail): Promise<boolean> {
  try {
    if (smtp) {
      await smtp.sendMail({ from: fromAddress, ...email });
      return true;
    }
    if (resend) {
      const { error } = await resend.emails.send({ from: fromAddress, ...email });
      return !error;
    }
  } catch (error) {
    console.error("email send error:", error);
  }
  return false;
}
/** ADMIN_EMAIL acceptă mai multe adrese separate prin virgulă. */
const adminEmail = (process.env.ADMIN_EMAIL || siteConfig.contact.email)
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean);

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
  const html = `
    <p>Bună ziua, ${reservation.name}!</p>
    <p>Am primit solicitarea ta de rezervare. Te vom contacta în scurt timp pentru confirmare.</p>
    <h3>Sumar rezervare</h3>
    ${reservationSummaryHtml(reservation)}
    <p>Cu stimă,<br/>${siteConfig.name}</p>
  `;
  return sendEmail({
    to: reservation.email,
    subject: `[TRT Rent a Car] Am primit solicitarea ta de rezervare`,
    html,
  });
}

/** Trimite email admin: solicitare nouă în așteptare. */
export async function sendAdminNewRequest(reservation: Reservation): Promise<boolean> {
  const html = `
    <p>Ai o solicitare de rezervare în așteptare.</p>
    <h3>Sumar</h3>
    ${reservationSummaryHtml(reservation)}
    <p>Conectează-te la admin pentru a confirma sau anula: <a href="${siteConfig.url}/admin/rezervari">Rezervări</a></p>
  `;
  return sendEmail({
    to: adminEmail,
    subject: `[TRT Rent a Car] Solicitare rezervare nouă${reservation.reference ? ` – ${reservation.reference}` : ""} – ${reservation.carName} – ${reservation.name}`,
    html,
  });
}

/** Trimite email client: rezervare confirmată. */
export async function sendClientConfirmed(reservation: Reservation): Promise<boolean> {
  const html = `
    <p>Bună ziua, ${reservation.name}!</p>
    <p>Rezervarea ta a fost <strong>confirmată</strong>.</p>
    <h3>Sumar</h3>
    ${reservationSummaryHtml(reservation)}
    <p>Te așteptăm! Cu stimă,<br/>${siteConfig.name}</p>
  `;
  return sendEmail({
    to: reservation.email,
    subject: `[TRT Rent a Car] Rezervare confirmată`,
    html,
  });
}

/** Trimite email client: rezervare anulată. */
export async function sendClientCancelled(reservation: Reservation): Promise<boolean> {
  const html = `
    <p>Bună ziua, ${reservation.name}!</p>
    <p>Rezervarea ta a fost <strong>anulată</strong>.</p>
    <p>Dacă dorești o nouă rezervare, ne poți contacta oricând.</p>
    <p>Cu stimă,<br/>${siteConfig.name}</p>
  `;
  return sendEmail({
    to: reservation.email,
    subject: `[TRT Rent a Car] Rezervare anulată`,
    html,
  });
}

/** Trimite email admin: rezervare confirmată/anulată (notificare). */
export async function sendAdminStatusChange(reservation: Reservation): Promise<boolean> {
  const statusLabel = reservation.status === "confirmed" ? "confirmată" : "anulată";
  const html = `
    <p>Rezervarea ${reservation.reference || `#${reservation.id}`} a fost ${statusLabel}.</p>
    <p><strong>Client:</strong> ${reservation.name} (${reservation.email})</p>
    <p><strong>Mașină:</strong> ${reservation.carName}, ${formatDisplayDate(reservation.pickupDate)} – ${formatDisplayDate(reservation.returnDate)}</p>
  `;
  return sendEmail({
    to: adminEmail,
    subject: `[TRT Rent a Car] Rezervare ${statusLabel}${reservation.reference ? ` – ${reservation.reference}` : ""} – ${reservation.name}`,
    html,
  });
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
  const html = `
    <p>Ai un mesaj nou din formularul de contact.</p>
    <p><strong>Nume:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    ${payload.phone ? `<p><strong>Telefon:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
    <p><strong>Mesaj:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br/>")}</p>
  `;
  return sendEmail({
    to: adminEmail,
    replyTo: payload.email,
    subject: `[TRT Rent a Car] Mesaj contact – ${payload.name}`,
    html,
  });
}

export async function sendClientContactReceived(payload: ContactPayload): Promise<boolean> {
  const html = `
    <p>Bună ziua, ${escapeHtml(payload.name)}!</p>
    <p>Am primit mesajul tău și îți vom răspunde în cel mai scurt timp.</p>
    <p><strong>Mesajul tău:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br/>")}</p>
    <p>Cu stimă,<br/>${siteConfig.name}</p>
  `;
  return sendEmail({
    to: payload.email,
    subject: `[TRT Rent a Car] Am primit mesajul tău`,
    html,
  });
}
