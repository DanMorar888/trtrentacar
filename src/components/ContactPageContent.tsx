"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { Button } from "@/components/Button";
import { Toast } from "@/components/Toast";
import { LegalDocLink, LegalModal, type LegalDoc } from "@/components/LegalModal";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/LocaleProvider";

const ReCAPTCHA = dynamic(
  () => import("react-google-recaptcha").then((mod) => mod.default),
  { ssr: false }
) as typeof import("react-google-recaptcha").default;

export function ContactPageContent() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const recaptchaRef = useRef<import("react-google-recaptcha").ReCAPTCHA | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCaptchaError(null);

    if (!agreedToTerms) {
      setCaptchaError(t.contact.termsRequired);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const captchaToken = siteKey ? recaptchaRef.current?.getValue?.() ?? "" : "";

    if (siteKey && !captchaToken) {
      setCaptchaError(t.contact.captchaRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          captchaToken,
          agreedToTerms,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCaptchaError(data?.error ?? t.contact.sendError);
        recaptchaRef.current?.reset?.();
        return;
      }

      recaptchaRef.current?.reset?.();
      setSent(true);
      setShowToast(true);
    } catch {
      setCaptchaError(t.contact.sendError);
      recaptchaRef.current?.reset?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="hero-home-bg relative py-12 lg:py-24 lg:min-h-[50vh] lg:flex lg:items-center">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10 flex w-full flex-col items-center text-center">
          <h1 className="section-title-dark max-w-full">{t.contact.title}</h1>
          <p className="mt-2 max-w-full text-gray-200">{t.contact.subtitle}</p>
        </div>
      </section>

      <section className="section-dark py-12">
        <div className="container-narrow">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-white">{t.contact.email}</h2>
              <p className="mt-2 text-gray-300">
                <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
                  {siteConfig.contact.email}
                </a>
              </p>

              <h2 className="mt-8 text-lg font-semibold text-white">{t.contact.phone}</h2>
              <p className="mt-2 text-gray-300">
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="text-primary hover:underline">
                  {siteConfig.contact.phone}
                </a>
              </p>

              <h2 className="mt-8 text-lg font-semibold text-white">{t.contact.hours}</h2>
              <p className="mt-2 text-primary">{siteConfig.openingHoursText}</p>

              <div className="mt-8 flex gap-4">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  WhatsApp
                </a>
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="btn-outline">
                  {t.contact.callNow}
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">{t.contact.formTitle}</h2>
              {sent ? (
                <p className="mt-4 rounded-lg bg-green-900/40 p-4 text-green-200">
                  {t.contact.success}
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300">
                      {t.contact.name}
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      className="mt-1 w-full rounded-lg border border-gray-500 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300">
                      {t.contact.email}
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      className="mt-1 w-full rounded-lg border border-gray-500 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-300">
                      {t.contact.phone}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className="mt-1 w-full rounded-lg border border-gray-500 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300">
                      {t.contact.message}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-500 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {siteKey ? (
                    <div>
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={siteKey}
                        theme="dark"
                        onChange={() => setCaptchaError(null)}
                      />
                      {captchaError ? (
                        <p className="mt-2 text-sm text-red-400" role="alert">
                          {captchaError}
                        </p>
                      ) : null}
                    </div>
                  ) : captchaError ? (
                    <p className="text-sm text-red-400" role="alert">
                      {captchaError}
                    </p>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <input
                      id="contact-agree-terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      aria-labelledby="contact-agree-copy"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-gray-500 text-primary focus:ring-primary"
                    />
                    <p id="contact-agree-copy" className="text-sm text-gray-300">
                      <label htmlFor="contact-agree-terms">{t.contact.termsPrefix} </label>
                      <LegalDocLink doc="terms" onOpen={setLegalDoc}>
                        {t.contact.termsLink}
                      </LegalDocLink>{" "}
                      <label htmlFor="contact-agree-terms">{t.contact.termsMid} </label>
                      <LegalDocLink doc="privacy" onOpen={setLegalDoc}>
                        {t.contact.privacyLink}
                      </LegalDocLink>
                      .
                    </p>
                  </div>
                  <Button type="submit" variant="primary" loading={submitting}>
                    {t.contact.send}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <Toast
        visible={showToast}
        message={t.contact.success}
        type="success"
        onClose={() => setShowToast(false)}
        autoClose={5000}
      />
      <LegalModal document={legalDoc} onClose={() => setLegalDoc(null)} />
    </>
  );
}
