"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

export type FaqItem = { q: string; a: string };

function FaqAnswer({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <div className="space-y-2 text-base leading-relaxed text-gray-300">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n").filter(Boolean);
        const items = lines.filter((line) => line.startsWith("• "));
        const intro = lines.filter((line) => !line.startsWith("• "));
        if (items.length === 0) {
          return (
            <p key={index} className="break-words">
              {paragraph}
            </p>
          );
        }
        return (
          <div key={index} className="space-y-2">
            {intro.map((line, lineIndex) => (
              <p key={`${index}-intro-${lineIndex}`} className="break-words">
                {line}
              </p>
            ))}
            <ul className="list-disc space-y-1 pl-5">
              {items.map((line, lineIndex) => (
                <li key={`${index}-item-${lineIndex}`} className="break-words">
                  {line.slice(2)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function HomeFaq({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    const nextButton = buttonRefs.current[next];
    nextButton?.focus({ preventScroll: true });
    nextButton?.scrollIntoView({ block: "nearest" });
  }

  return (
    <section className="section-dark py-12 lg:py-16" aria-labelledby={`${baseId}-title`}>
      <div className="container-narrow">
        <h2 id={`${baseId}-title`} className="section-title-dark mb-2">
          {title}
        </h2>
        <p className="mb-8 max-w-3xl text-gray-300">{subtitle}</p>
        <div className="flex min-w-0 flex-col gap-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            const buttonId = `${baseId}-q-${index}`;
            const panelId = `${baseId}-a-${index}`;
            return (
              <div
                key={item.q}
                className={`min-w-0 scroll-mt-24 overflow-hidden rounded-xl border shadow-sm transition-colors ${
                  open ? "border-primary/70 bg-slate-700/80 shadow-md" : "border-gray-700 bg-dark-light"
                }`}
              >
                <h3 className="text-base font-semibold">
                  <button
                    ref={(node) => {
                      buttonRefs.current[index] = node;
                    }}
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className="flex min-h-11 w-full scroll-mt-24 items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary sm:gap-4 sm:px-5"
                  >
                    <span className={`min-w-0 flex-1 break-words ${open ? "text-primary" : "text-white"}`}>
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        open ? "bg-primary text-white" : "bg-primary/20 text-primary"
                      }`}
                    >
                      <Chevron
                        className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!open}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className={`min-h-0 overflow-hidden ${open ? "" : "pointer-events-none"}`}>
                    <div className="border-t border-gray-600/70 px-4 pb-5 pt-4 sm:px-5">
                      <div className="max-w-3xl">
                        <FaqAnswer text={item.a} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
