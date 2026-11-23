import { NextResponse } from "next/server";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ success: false, error: "Token lipsă" }, { status: 400 });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.error("RECAPTCHA_SECRET_KEY nu este setat");
      return NextResponse.json(
        { success: false, error: "Configurare captcha lipsă" },
        { status: 500 }
      );
    }

    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);

    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = (await res.json()) as {
      success: boolean;
      challenge_ts?: string;
      hostname?: string;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: "Verificare captcha eșuată", codes: data["error-codes"] },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-captcha error:", err);
    return NextResponse.json(
      { success: false, error: "Eroare la verificare" },
      { status: 500 }
    );
  }
}
