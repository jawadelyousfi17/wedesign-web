import React from "react";
import Link from "next/link";
import { Share2, GitBranchPlus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import JournalPostClient from "./journal-post-client";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.article.findUnique({
    where: {
      slug: slug,
    },
    include: {
      author: true,
    },
  });

  if (!post) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date).toUpperCase();
  };

  return (
    <div className="bg-card flex flex-col font-sans text-foreground">
      <JournalPostClient />
      
      <main className="flex-1 max-w-4xl mx-auto w-full relative">
        {/* Paper Margin Lines */}
        <div className="absolute top-0 bottom-0 left-[2rem] md:left-[0rem] w-px bg-red-400/20 z-0 hidden md:block"></div>
        <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[0.25rem] w-px bg-red-400/20 z-0 hidden md:block"></div>

        <article className="relative z-10 py-16 px-8 md:pl-16 pr-8 bg-[#fdfaf5]">
          {/* Back button */}
          <Link href="/journal" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/60 hover:text-black mb-16 transition-colors group">
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span>Back to Journal</span>
          </Link>

          {/* Post Meta & Header */}
          <header className="mb-20 border-b border-foreground/20 pb-16">
            <div className="flex flex-wrap items-center gap-4 mb-8 text-xs uppercase tracking-widest text-foreground/75">
               <span className="italic font-serif text-sm">{formatDate(post.publishedAt)}</span>
               <span className="w-[3px] h-[3px] bg-foreground rounded-full"></span>
               <span>{post.readTime || "5 MIN READ"}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] mb-12">
              {post.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-4">
                {/* Author Avatar Dummy */}
                {post.author.avatarUrl ? (
                  <img 
                    src={post.author.avatarUrl} 
                    alt={post.author.name} 
                    className="w-12 h-12 rounded-full border border-foreground"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-foreground bg-primary flex items-center justify-center font-serif text-2xl">
                    {post.author.name[0]}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-foreground/50">Written By</span>
                  <span className="font-medium text-lg">{post.author.name}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <span className="border border-foreground px-3 py-1 text-xs uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer">
                  {post.category}
                </span>
              </div>
            </div>
          </header>

          {/* Render Actual Markdown */}
          <div className="markdown-body">
             <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Share Section */}
          <footer className="mt-24 pt-8 border-t border-foreground/20 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-3xl font-serif italic text-foreground tracking-tight">
               Did you enjoy this reading?
             </div>
             
             <div className="flex gap-4">
                <button className="group flex items-center gap-3 border border-foreground px-6 py-3 hover:bg-primary transition-colors">
                  <Share2 size={16} />
                  <span className="text-xs uppercase tracking-widest">Share</span>
                </button>
                <button className="group flex items-center gap-3 border border-foreground px-6 py-3 hover:bg-black hover:text-white transition-colors">
                  <GitBranchPlus size={16} fill="currentColor" />
                  <span className="text-xs uppercase tracking-widest">Tweet</span>
                </button>
             </div>
          </footer>
        </article>
      </main>

      {/* Scoped brutalist markdown styles simulating a Markdown text renderer */}
      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-body {
          font-family: var(--font-sans);
          color: var(--foreground);
        }
        .markdown-body p {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .markdown-body h2 {
          font-family: var(--font-serif);
          font-size: 3.5rem;
          line-height: 1.1;
          margin-top: 5rem;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
        }
        .markdown-body blockquote {
          border-left: 4px solid var(--foreground);
          padding-left: 2rem;
          margin: 3rem 0;
          font-family: var(--font-serif);
          font-size: 2rem;
          line-height: 1.4;
          font-style: italic;
          color: var(--foreground);
        }
        .markdown-body ul {
          list-style-type: square;
          margin-left: 1.5rem;
          margin-bottom: 2.5rem;
          font-size: 1.25rem;
        }
        .markdown-body li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .markdown-body pre {
          background: var(--foreground);
          color: var(--background);
          padding: 2.5rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.95rem;
          margin: 3rem 0;
          border-radius: 2px;
        }
        .markdown-body code {
          font-family: var(--font-mono);
        }
        .markdown-body strong {
          font-weight: 600;
          color: var(--foreground);
        }
      `}} />
    </div>
  );
}
