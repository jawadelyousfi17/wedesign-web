"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Article, TeamMember } from '@prisma/client';

type ArticleWithAuthor = Article & {
  author: TeamMember;
};

interface JournalClientProps {
  initialArticles: ArticleWithAuthor[];
}

const CATEGORIES = ['All', 'Design', 'Dev', 'Typography', 'Opinion'];

export default function JournalClient({ initialArticles }: JournalClientProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = activeCategory === 'All' 
    ? initialArticles 
    : initialArticles.filter(post => post.category.toLowerCase() === activeCategory.toLowerCase());

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto w-full relative px-8 py-16 bg-card">
      <div className="relative z-10 pr-4">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] mb-6">
            The Journal.
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl leading-relaxed mb-8">
            A logbook of our thoughts, technical deep-dives, design rants, and manifestos.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 border border-foreground uppercase tracking-widest text-xs transition-colors duration-300 ${
                  activeCategory === cat
                    ? 'bg-foreground text-background'
                    : 'hover:bg-[#eaddcf]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Grid Layout */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 border-r border-b border-foreground/20 bg-card overflow-hidden">
          <AnimatePresence mode='popLayout'>
            {filteredPosts.map((post) => (
              <Link href={`/journal/${post.slug}`} key={post.id} className="contents group">
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative cursor-pointer overflow-hidden border-t border-l border-foreground/20 p-8 flex flex-col justify-between min-h-[300px] hover:bg-[#eaddcf] transition-colors duration-500 ease-[0.22,1,0.36,1]"
                >
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    
                    {/* Journal Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="text-sm font-serif italic text-foreground/75 transition-colors duration-500 group-hover:text-black/75">
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="text-xs uppercase tracking-widest text-foreground/50 transition-colors duration-500 group-hover:text-black/50 border border-foreground/10 px-2 py-0.5">
                        {post.category}
                      </div>
                    </div>

                    {/* Journal Title */}
                    <div className="flex-1 flex flex-col justify-center py-6">
                      <h3 className="text-4xl font-serif tracking-tight leading-tight text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:text-black group-hover:pl-4">
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
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredPosts.length === 0 && (
            <div className="py-24 text-center text-foreground/50 text-xl font-serif italic border border-foreground/20 mt-4">
              No entries found for this category.
            </div>
        )}
      </div>
    </div>
  );
}
