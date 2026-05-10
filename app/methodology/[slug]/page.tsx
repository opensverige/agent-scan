// app/methodology/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import { MethodologyView } from "@/components/methodology-view";
import { RelatedArticles } from "@/components/related-articles";
import { MethodologyToc } from "@/components/methodology-toc";
import {
  loadArticle,
  listArticles,
  findNeighbours,
} from "@/lib/methodology/load";
import {
  buildTechArticleSchema,
  buildHowToSchema,
  buildBreadcrumbSchema,
} from "@/lib/methodology/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const entries = await listArticles();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) return {};

  const url = `https://agent.opensverige.se/methodology/${article.frontmatter.slug}`;

  return {
    title: `${article.frontmatter.title} · methodology`,
    description: article.frontmatter.citableLead.trim().slice(0, 200),
    alternates: {
      canonical: url,
      types: {
        "text/markdown": url,
      },
    },
    openGraph: {
      type: "article",
      url,
      title: article.frontmatter.title,
      description: article.frontmatter.citableLead.trim().slice(0, 200),
      publishedTime: article.frontmatter.lastUpdated,
      modifiedTime: article.frontmatter.lastUpdated,
      authors: ["https://opensverige.se/#organization"],
      tags: [
        article.frontmatter.checkId,
        article.frontmatter.category,
        ...article.frontmatter.relatedChecks,
      ],
      images: [
        {
          url: "https://agent.opensverige.se/assets/og-default.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.frontmatter.title,
      description: article.frontmatter.citableLead.trim().slice(0, 200),
    },
  };
}

export default async function MethodologyArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();

  const all = await listArticles();
  const { prev, next } = findNeighbours(
    { slug: article.frontmatter.slug, category: article.frontmatter.category },
    all,
  );

  const techArticleSchema = buildTechArticleSchema(article);
  const howToSchema = buildHowToSchema(article);
  const breadcrumbSchema = buildBreadcrumbSchema(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* The whole methodology page (Nav + content + Footer) is wrapped in
          [data-methodology] so the light helpdesk theme tokens cascade to
          all descendants. Nav/Footer therefore inherit the same warm-paper
          palette as the article body — no dark-on-light clash. */}
      <div data-methodology className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">
          <div className="mx-auto max-w-[1180px] px-6 py-12 md:py-16">
            {/* Mobile TOC drawer (above article on small screens) */}
            <details className="mb-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 xl:hidden">
              <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] [&::-webkit-details-marker]:hidden">
                On this page
              </summary>
              <div className="mt-4">
                <MethodologyToc body={article.body} withHeading={false} />
              </div>
            </details>

            {/* Desktop grid: article on left, sticky TOC on right */}
            <div className="xl:grid xl:grid-cols-[minmax(0,720px)_220px] xl:items-start xl:gap-16">
              <div className="min-w-0">
                <MethodologyView article={article} />
                <PrevNextNav prev={prev} next={next} />
              </div>
              <MethodologyToc
                body={article.body}
                className="hidden xl:sticky xl:top-24 xl:block xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
              />
            </div>
          </div>

          <RelatedArticles article={article} />
        </main>
        <Footer />
      </div>
    </>
  );
}

function PrevNextNav({
  prev,
  next,
}: {
  prev: Awaited<ReturnType<typeof findNeighbours>>["prev"];
  next: Awaited<ReturnType<typeof findNeighbours>>["next"];
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="Article navigation"
      className="my-12 grid gap-3 border-y border-[hsl(var(--border))] py-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/methodology/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-lg p-3 transition-colors hover:bg-[hsl(var(--muted))]/40"
        >
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            <MdArrowBack
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            Previous · {prev.category}
          </span>
          <span className="font-serif text-[16px] leading-snug text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))]">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next ? (
        <Link
          href={`/methodology/${next.slug}`}
          className="group flex flex-col items-end gap-1 rounded-lg p-3 text-right transition-colors hover:bg-[hsl(var(--muted))]/40"
        >
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Next · {next.category}
            <MdArrowForward
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
          <span className="font-serif text-[16px] leading-snug text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))]">
            {next.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
