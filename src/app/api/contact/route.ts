import { NextResponse } from "next/server";
import { addContactMessage } from "@/lib/contact-db";
import { sendAdminContactMessage, sendClientContactReceived } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);

  const res = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const captchaToken = typeof body?.captchaToken === "string" ? body.captchaToken.trim() : "";
    const agreedToTerms = body?.agreedToTerms === true;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Completează numele, emailul și mesajul." },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Adresa de email nu este validă." }, { status: 400 });
    }
    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "Trebuie să accepți Termenele și Condițiile." },
        { status: 400 }
      );
    }

    const captchaOk = await verifyCaptcha(captchaToken);
    if (!captchaOk) {
      return NextResponse.json({ error: "Verificarea captcha a eșuat." }, { status: 400 });
    }

    const saved = await addContactMessage({
      name,
      email,
      phone: phone || undefined,
      message,
    });

    const payload = { name, email, phone: phone || undefined, message };
    const [adminSent, clientSent] = await Promise.all([
      sendAdminContactMessage(payload),
      sendClientContactReceived(payload),
    ]);

    return NextResponse.json({
      success: true,
      id: saved.id,
      emailSent: adminSent || clientSent,
    });
  } catch (e) {
    console.error("contact API error:", e);
    return NextResponse.json(
      { error: "A apărut o eroare la trimitere. Încearcă din nou." },
      { status: 500 }
    );
  }
}
