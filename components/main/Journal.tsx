"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Article, TeamMember } from '@prisma/client';
import Link from 'next/link';

type ArticleWithAuthor = Article & {
  author: TeamMember;
};

interface JournalProps {
  articles: ArticleWithAuthor[];
}

const ease = [0.22, 1, 0.36, 1] as const;

const Journal: React.FC<JournalProps> = ({ articles }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit'
    }).format(date).toUpperCase();
  };

  return (
    <section ref={ref} className="py-8 px-8" id="journal">
      <h2 className="text-5xl font-semibold mb-12">
        Journal.
      </h2>
    
      <div className="grid grid-cols-1 md:grid-cols-2 border-r border-b border-foreground bg-card">
        {articles.map((post, i) => (
          <Link href={`/journal/${post.slug}`} key={post.id} className="contents group">
            <motion.article
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease }}
              className="group relative cursor-pointer overflow-hidden border-t border-l border-foreground p-8 flex flex-col justify-between min-h-[300px] hover:bg-primary transition-colors duration-500 ease-[0.22,1,0.36,1]"
            >
              {/* Content wrapper to stay above background */}
              <div className="relative z-10 flex flex-col h-full justify-between">
                
                {/* Journal Header */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="text-sm font-serif italic text-foreground/75 transition-colors duration-500 group-hover:text-black/75">
                    {formatDate(post.publishedAt)}
                  </div>
                </div>

                {/* Journal Title */}
                <div className="flex-1 flex flex-col justify-center py-6">
                  <h3 className="text-7xl font-serif tracking-tight leading-tight text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:text-black group-hover:pl-4">
                    {post.title}
                  </h3>
                </div>
                
                {/* Journal Footer */}
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-foreground/50 transition-colors duration-500 group-hover:text-black/50">
                      Written By
                    </span>
                    <span className="text-sm font-medium text-foreground transition-colors duration-500 group-hover:text-black">
                      {post.author.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-widest text-foreground/60 transition-colors duration-500 group-hover:text-black/60">
                      {post.readTime || "5 MIN READ"}
                    </span>
                    <div className="relative overflow-hidden w-6 h-6 flex items-center justify-center">
                      <span className="absolute text-2xl text-foreground transition-transform duration-500 ease-[0.22,1,0.36,1] group-hover:translate-x-full group-hover:-translate-y-full">
                        →
                      </span>
                      <span className="absolute text-2xl text-black transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Journal;
