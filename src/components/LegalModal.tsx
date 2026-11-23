"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LegalDocument } from "@/components/LegalDocument";
import { termsContent } from "@/components/legal/TermsContent";
import { privacyContent } from "@/components/legal/PrivacyContent";
import { useI18n } from "@/i18n/LocaleProvider";

export type LegalDoc = "terms" | "privacy";

const DOC_HREF: Record<LegalDoc, string> = {
  terms: "/termeni-si-conditii",
  privacy: "/politica-confidentialitate",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function LegalDocLink({
  doc,
  onOpen,
  children,
  className = "text-primary underline hover:no-underline",
}: {
  doc: LegalDoc;
  onOpen: (doc: LegalDoc) => void;
  children: ReactNode;
  className?: string;
}) {
  const href = DOC_HREF[doc];

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    onOpen(doc);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} onMouseDown={(e) => e.stopPropagation()}>
      {children}
    </Link>
  );
}

export function LegalModal({
  document: doc,
  onClose,
}: {
  document: LegalDoc | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const open = doc !== null;
  const title = doc === "privacy" ? t.legal.privacyTitle : t.legal.conditiiTitle;

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      closeRef.current?.focus();
    };
    const id = window.setTimeout(focusFirst, 0);

    function getFocusable() {
      if (!dialog) return [] as HTMLElement[];
      return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-800 bg-slate-950 shadow-2xl sm:max-h-[min(100dvh-3rem,52rem)]"
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-gray-800 px-4 py-3 sm:px-5">
          <h2 id={titleId} className="min-w-0 flex-1 text-base font-semibold leading-snug text-white sm:text-lg">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={t.legal.close}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              ×
            </span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <p className="mb-5 rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-gray-300">
            {t.legal.officialNote}
          </p>
          <LegalDocument tocLabel={t.legal.toc} showToc={false} compact>
            {doc === "privacy" ? privacyContent : termsContent}
          </LegalDocument>
        </div>
        <div className="flex shrink-0 justify-end border-t border-gray-800 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t.legal.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
