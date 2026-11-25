import { LocaleLink } from "@/components/LocaleLink";
import type { Metadata } from "next";
import { getLatestArticles } from "@/data/articles";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { CarImage } from "@/components/CarImage";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { ItemListJsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-identity";
import { localePath } from "@/i18n/paths";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/blog",
    title: t.meta.blogTitle,
    description: t.meta.blogDescription,
  });
}

export default function BlogPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const posts = getLatestArticles();

  return (
    <>
      <ItemListJsonLd
        name={t.blog.title}
        items={posts.map((article) => ({
          name: article.title[locale],
          url: `${SITE_URL.replace(/\/$/, "")}${localePath(locale, `/blog/${article.slug}`)}`,
        }))}
      />
      <section className="hero-home-bg relative py-12 lg:py-24 lg:min-h-[40vh] lg:flex lg:items-center">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10 flex w-full flex-col items-center text-center">
          <h1 className="section-title-dark max-w-full">{t.blog.title}</h1>
          <p className="mt-2 max-w-full text-gray-200">{t.blog.subtitle}</p>
        </div>
      </section>

      <section className="section-dark py-12">
        <div className="container-narrow">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((article) => (
              <article
                key={article.id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-900/40 shadow-sm"
              >
                <LocaleLink href={`/blog/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-gray-800">
                  <CarImage
                    src={article.image}
                    alt={article.title[locale]}
                    fallbackName={article.title[locale]}
                    className="!absolute inset-0"
                    sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 400px"
                  />
                </LocaleLink>
                <div className="flex flex-1 flex-col p-5">
                  <time className="text-xs uppercase tracking-wider text-gray-400" dateTime={article.date}>
                    {article.date}
                  </time>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    <LocaleLink href={`/blog/${article.slug}`} className="hover:text-primary">
                      {article.title[locale]}
                    </LocaleLink>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-gray-300">{article.excerpt[locale]}</p>
                  <LocaleLink href={`/blog/${article.slug}`} className="mt-4 text-sm font-semibold text-primary hover:underline">
                    {t.blog.readMore}
                  </LocaleLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
