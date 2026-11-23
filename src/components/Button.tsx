"use client";

import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark hover:shadow focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:pointer-events-none",
  outline:
    "inline-flex items-center justify-center rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:pointer-events-none",
  ghost:
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:pointer-events-none",
};

interface ButtonBaseProps {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  type?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  href,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const baseClass = variantClasses[variant];
  const isDisabled = disabled || loading;

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className={`${baseClass} ${className}`.trim()}
        onClick={onClick}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            Se încarcă…
          </>
        ) : (
          children
        )}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={`${baseClass} ${className}`.trim()}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          Se trimite…
        </>
      ) : (
        children
      )}
    </button>
  );
}
