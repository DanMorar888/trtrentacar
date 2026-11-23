import type { ReactNode } from "react";

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-xl border border-gray-600 bg-gray-800/50 p-4 shadow">
      {children}
    </article>
  );
}

export function AdminCardRow({
  label,
  children,
  stacked = false,
}: {
  label: string;
  children: ReactNode;
  stacked?: boolean;
}) {
  return (
    <div
      className={
        stacked
          ? "space-y-1.5 py-2"
          : "flex items-start justify-between gap-3 py-2"
      }
    >
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd
        className={`min-w-0 break-words text-sm text-gray-100 ${stacked ? "" : "text-right"}`}
      >
        {children}
      </dd>
    </div>
  );
}

export function AdminCardActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex flex-wrap gap-2 border-t border-gray-600 pt-3">
      <span className="w-full text-xs font-medium uppercase tracking-wide text-gray-400">
        Acțiuni
      </span>
      {children}
    </div>
  );
}

export const adminCardEditClass =
  "inline-flex min-h-11 min-w-[6rem] flex-1 items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700";

export const adminCardDeleteClass =
  "inline-flex min-h-11 min-w-[6rem] flex-1 items-center justify-center rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30";

export const adminCardSecondaryClass =
  "inline-flex min-h-11 min-w-[6rem] flex-1 items-center justify-center rounded-lg border border-gray-500 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700";
