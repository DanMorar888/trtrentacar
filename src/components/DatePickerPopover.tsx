"use client";

import { DayPicker } from "react-day-picker";
import { enUS, hu, ro } from "react-day-picker/locale";
import "react-day-picker/style.css";
import type { Locale } from "@/i18n/config";

interface DatePickerPopoverProps {
  locale: Locale;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  defaultMonth?: Date;
}

export function DatePickerPopover({
  locale,
  selected,
  onSelect,
  disabled,
  defaultMonth,
}: DatePickerPopoverProps) {
  return (
    <DayPicker
      mode="single"
      locale={locale === "en" ? enUS : locale === "hu" ? hu : ro}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      defaultMonth={defaultMonth}
      showOutsideDays
    />
  );
}
