"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { format, parseISO, isValid, startOfDay } from "date-fns";
import { formatDisplayDate } from "@/lib/format-date";
import { useI18n } from "@/i18n/LocaleProvider";

const DatePickerPopover = dynamic(
  () => import("@/components/DatePickerPopover").then((mod) => mod.DatePickerPopover),
  { ssr: false }
);

interface DateFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  min?: string;
  max?: string;
}

function toDate(s: string): Date | undefined {
  if (!s || !s.trim()) return undefined;
  const d = parseISO(s.trim());
  return isValid(d) ? d : undefined;
}

function toValue(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function DateField({
  id,
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  min,
  max,
}: DateFieldProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDate = toDate(value);
  const datePlaceholder = placeholder ?? t.widget.chooseDate;
  const minDate = min ? toDate(min) : undefined;
  const maxDate = max ? toDate(max) : undefined;
  const today = startOfDay(new Date());
  const effectiveMin = minDate && minDate > today ? minDate : today;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Folosim click (nu mousedown) ca selectarea zilei în calendar să se proceseze înainte
    const id = window.setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  const displayValue = value ? formatDisplayDate(value, locale) : "";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${className}`.trim()}
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-500"}>
          {displayValue || datePlaceholder}
        </span>
        <span className="shrink-0 text-gray-400" aria-hidden>
          <CalendarIcon />
        </span>
      </button>
      {open && (
        <div
          className="date-picker-dropdown absolute left-0 top-full z-50 mt-1 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label={t.widget.calendar}
        >
          <DatePickerPopover
            locale={locale}
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(toValue(date));
                setOpen(false);
              }
            }}
            disabled={(date) => {
              if (date < effectiveMin) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            defaultMonth={selectedDate ?? effectiveMin ?? new Date()}
          />
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
