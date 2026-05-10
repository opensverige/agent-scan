// app/methodology/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import { MethodologyView } from "@/components/methodology-view";
import {
  loadArticle,
  listArticles,
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
      <Nav />
      <MethodologyView article={article} />
      <Footer />
    </>
  );
}
