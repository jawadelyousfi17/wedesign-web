import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import JournalPostClient from "./journal-post-client";
import PostActions from "./post-actions";
import ReadingProgress from "./reading-progress";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.article.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) notFound();

  const nextPost = post.publishedAt
    ? await prisma.article.findFirst({
        where: {
          publishedAt: { lt: post.publishedAt },
          id: { not: post.id },
        },
        orderBy: { publishedAt: "desc" },
        include: { author: true },
      })
    : null;

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="relative bg-background flex flex-col text-foreground min-h-screen">
      {/* paper noise texture */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.5] mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* dot grid — corkboard backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <ReadingProgress />
      <JournalPostClient />

      <main className="relative z-10 flex-1 mx-auto w-full py-16 px-6 md:px-8">
        <Link
          href="/journal"
          className="group inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span>Back to the notebook</span>
        </Link>

        <header className="mb-16 pb-12 border-b-2 border-foreground">
          <div className="flex items-center gap-3 mb-8 flex-wrap text-sm text-foreground/70">
            {post.category && (
              <span className="px-2.5 py-1 border border-foreground/30 text-foreground/80 text-xs">
                {post.category}
              </span>
            )}
            <span className="font-serif italic">{formatDate(post.publishedAt)}</span>
            {post.readTime && (
              <>
                <span className="w-1 h-1 bg-foreground/40 rounded-full" />
                <span className="font-serif italic">{post.readTime}</span>
              </>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.98] mb-10 text-foreground">
            {post.title}
          </h1>

          <div className="flex items-center gap-4">
            {post.author?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.image}
                alt=""
                className="w-12 h-12 border-2 border-foreground object-cover [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]"
              />
            ) : (
              <div className="w-12 h-12 border-2 border-foreground bg-primary flex items-center justify-center font-serif italic text-xl text-primary-foreground [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]">
                {(post.author?.name || post.author?.login1337)?.[0] ?? "?"}
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-foreground/50 font-serif italic">
                signed,
              </span>
              <span className="font-serif text-lg tracking-tight text-foreground">
                {post.author?.name || post.author?.login1337 || "the crew"}
              </span>
            </div>
          </div>
        </header>

        <div className="markdown-body">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-center gap-4 my-20 text-foreground/40">
          <span className="h-px flex-1 bg-foreground/20" />
          <span className="text-2xl">✷</span>
          <span className="h-px flex-1 bg-foreground/20" />
        </div>

        <PostActions title={post.title} />

        {nextPost && (
          <Link
            href={`/journal/${nextPost.slug}`}
            className="group relative block mt-20"
          >
            <div
              aria-hidden
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
            />
            <div className="relative border-2 border-foreground bg-card p-6 md:p-8 flex flex-col gap-4 hover:bg-primary/5 transition-colors duration-300">
              <div className="flex items-center justify-between text-xs text-foreground/60">
                <span>Keep reading</span>
                <span className="font-serif italic">
                  {formatDate(nextPost.publishedAt)}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif tracking-tight leading-tight text-foreground line-clamp-2">
                {nextPost.title}
              </h3>
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-foreground/15">
                <span className="text-sm text-foreground/60">
                  by {nextPost.author?.name || nextPost.author?.login1337 || "the crew"}
                </span>
                <span className="flex items-center gap-1.5 text-foreground font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  Next entry
                  <ArrowUpRight
                    size={16}
                    strokeWidth={2.5}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </div>
          </Link>
        )}
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .markdown-body { font-family: var(--font-serif); color: var(--color-foreground); }
        .markdown-body > * + * { margin-top: 1.75rem; }

        .markdown-body p {
          font-size: 1.2rem; line-height: 1.75;
          color: color-mix(in oklab, var(--color-foreground) 90%, transparent);
        }
        .markdown-body p:first-of-type::first-letter {
          font-family: var(--font-serif); font-weight: 600;
          font-size: 4.5rem; line-height: 0.9;
          float: left; margin: 0.35rem 0.75rem 0 -0.15rem;
          color: var(--color-accent);
        }

        .markdown-body h2 {
          font-family: var(--font-serif); font-size: clamp(2.25rem, 4vw, 3rem);
          font-weight: 600; line-height: 1.1;
          margin-top: 4.5rem; margin-bottom: 0.5rem;
          letter-spacing: -0.02em; color: var(--color-foreground);
        }
        .markdown-body h3 {
          font-family: var(--font-serif); font-size: 1.75rem;
          font-style: italic; font-weight: 500; line-height: 1.2;
          margin-top: 3rem; letter-spacing: -0.01em;
          color: var(--color-foreground);
        }
        .markdown-body h4 {
          font-family: var(--font-sans); font-size: 1rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-top: 2.5rem; color: var(--color-foreground);
        }

        .markdown-body a {
          color: var(--color-foreground);
          text-decoration: underline;
          text-decoration-color: var(--color-primary);
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
          transition: text-decoration-color 0.2s;
        }
        .markdown-body a:hover { text-decoration-color: var(--color-accent); }

        .markdown-body blockquote {
          border-left: 4px solid var(--color-accent);
          padding: 0.5rem 0 0.5rem 1.75rem;
          margin: 3rem 0;
          font-family: var(--font-serif);
          font-size: 1.6rem; line-height: 1.4;
          font-style: italic; color: var(--color-foreground); opacity: 0.9;
        }
        .markdown-body blockquote p { font-size: inherit; line-height: inherit; }

        .markdown-body ul, .markdown-body ol {
          margin-left: 1.5rem; margin-bottom: 2rem;
          font-size: 1.2rem; line-height: 1.75;
        }
        .markdown-body ul { list-style-type: none; }
        .markdown-body ul li { position: relative; padding-left: 0.25rem; }
        .markdown-body ul li::before {
          content: "✷"; position: absolute; left: -1.5rem;
          color: var(--color-accent); font-size: 0.85em; top: 0.15em;
        }
        .markdown-body ol { list-style-type: decimal; }
        .markdown-body ol li::marker { color: var(--color-accent); font-weight: 600; }
        .markdown-body li { margin-bottom: 0.65rem; }

        .markdown-body pre {
          background: var(--color-foreground);
          color: var(--color-background);
          padding: 1.75rem; overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.9rem; line-height: 1.65;
          margin: 2.5rem 0; border: 2px solid var(--color-foreground);
        }
        .markdown-body pre code { background: transparent; padding: 0; border: 0; color: inherit; }
        .markdown-body code {
          font-family: var(--font-mono); font-size: 0.88em;
          background: color-mix(in oklab, var(--color-foreground) 8%, transparent);
          padding: 0.15em 0.4em;
          border: 1px solid color-mix(in oklab, var(--color-foreground) 15%, transparent);
        }

        .markdown-body strong { font-weight: 700; color: var(--color-foreground); }
        .markdown-body em { font-style: italic; }

        .markdown-body hr {
          border: 0; display: flex; justify-content: center;
          margin: 4rem 0; position: relative; height: 1.5rem;
        }
        .markdown-body hr::before {
          content: "✷ ✷ ✷"; letter-spacing: 1rem;
          color: var(--color-foreground); opacity: 0.3; font-size: 0.9rem;
        }

        .markdown-body img {
          width: 100%; border: 2px solid var(--color-foreground);
          margin: 3rem 0 0.75rem; display: block;
        }
        .markdown-body img + em {
          display: block; text-align: center;
          font-size: 0.85rem;
          color: color-mix(in oklab, var(--color-foreground) 60%, transparent);
          margin-bottom: 3rem;
        }

        .markdown-body table {
          width: 100%; border-collapse: collapse;
          margin: 2.5rem 0; font-size: 1rem;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid color-mix(in oklab, var(--color-foreground) 25%, transparent);
          padding: 0.75rem 1rem; text-align: left;
        }
        .markdown-body th {
          background: color-mix(in oklab, var(--color-foreground) 8%, transparent);
          font-weight: 700; font-family: var(--font-sans);
        }
      `,
        }}
      />
    </div>
  );
}
