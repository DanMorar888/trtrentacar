"use client";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function parseTime(value: string): { hour: number; minute: number } {
  const trimmed = (value || "").trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return { hour: 10, minute: 0 };
  let hour = Math.min(23, Math.max(0, parseInt(match[1], 10) || 0));
  let minute = Math.min(59, Math.max(0, parseInt(match[2], 10) || 0));
  minute = MINUTES.reduce((prev, curr) => (Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev));
  return { hour, minute };
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
}

export function TimeSelect({ value, onChange, id, className = "", "aria-describedby": ariaDescribedby }: TimeSelectProps) {
  const { hour, minute } = parseTime(value);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = parseInt(e.target.value, 10);
    onChange(formatTime(h, minute));
  };
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value, 10);
    onChange(formatTime(hour, m));
  };

  return (
    <div className={`flex w-full items-center gap-2 ${className}`.trim()}>
      <select
        id={id}
        value={hour}
        onChange={handleHourChange}
        className="h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        aria-describedby={ariaDescribedby}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="text-gray-500">:</span>
      <select
        value={minute}
        onChange={handleMinuteChange}
        className="h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
}
