import { LocaleLink } from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles, getArticleBySlug } from "@/data/articles";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { CarImage } from "@/components/CarImage";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { BlogPostingJsonLd } from "@/components/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = getLocale();
  const t = getDictionary(locale);
  const article = getArticleBySlug(slug);
  if (!article) return { title: t.blog.notFound };
  // Titlurile articolelor sunt lungi; fără sufixul cu numele firmei rămân întregi în Google.
  return buildPageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: article.title[locale],
    description: article.excerpt[locale],
    ogImage: article.image,
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const locale = getLocale();
  const t = getDictionary(locale);
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <BlogPostingJsonLd
        title={article.title[locale]}
        description={article.excerpt[locale]}
        slug={article.slug}
        date={article.date}
        image={article.image}
        locale={locale}
      />
      <section className="hero-home-bg relative py-12 lg:py-20">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10 flex w-full flex-col items-center text-center">
          <nav className="mb-4 text-sm text-gray-300" aria-label="Breadcrumb">
            <LocaleLink href="/" className="hover:text-primary">
              {t.car.home}
            </LocaleLink>
            <span className="mx-2">/</span>
            <LocaleLink href="/blog" className="hover:text-primary">
              {t.nav.blog}
            </LocaleLink>
          </nav>
          <h1 className="section-title-dark mx-auto max-w-4xl">{article.title[locale]}</h1>
          <p className="mt-3 text-sm text-gray-300">
            {t.blog.published}: <time dateTime={article.date}>{article.date}</time>
          </p>
        </div>
      </section>

      <section className="section-dark py-12">
        <div className="container-narrow max-w-3xl">
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-gray-800">
            <CarImage
              src={article.image}
              alt={article.title[locale]}
              fallbackName={article.title[locale]}
              className="!absolute inset-0"
              sizes="(max-width: 768px) calc(100vw - 2rem), 768px"
              priority
            />
          </div>
          <div
            className="prose prose-invert max-w-none [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:text-gray-300 [&_p]:text-gray-200 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: article.content[locale] }}
          />
          <p className="mt-10">
            <LocaleLink href="/blog" className="font-semibold text-primary hover:underline">
              ← {t.blog.back}
            </LocaleLink>
          </p>
        </div>
      </section>
    </>
  );
}
