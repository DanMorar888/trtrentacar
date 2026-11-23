import { NextResponse } from "next/server";
import { readNewsletterSubscribers, writeNewsletterSubscribers } from "@/lib/newsletter-db";
import type { NewsletterSubscriber } from "@/data/newsletter";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresa de email nu este validă" }, { status: 400 });
  }

  const subscribers = await readNewsletterSubscribers();
  const exists = subscribers.some((s) => s.email.toLowerCase() === email);
  if (exists) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  const next: NewsletterSubscriber[] = [
    ...subscribers,
    { email, subscribedAt: new Date().toISOString() },
  ];
  await writeNewsletterSubscribers(next);

  return NextResponse.json({ ok: true, alreadySubscribed: false });
}

