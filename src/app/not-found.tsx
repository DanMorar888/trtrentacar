import { LocaleLink } from "@/components/LocaleLink";
import { getDictionary } from "@/i18n/get-locale";

export default function NotFound() {
  const t = getDictionary();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-bold text-white">{t.error.notFoundTitle}</h1>
      <p className="max-w-md text-center text-sm text-gray-300">{t.error.notFoundText}</p>
      <LocaleLink href="/" className="btn-primary">
        {t.error.home}
      </LocaleLink>
    </div>
  );
}
