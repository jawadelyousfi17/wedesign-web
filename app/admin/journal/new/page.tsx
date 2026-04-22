"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createArticle } from '../actions';
import { ArticleCategory } from '@prisma/client';
import { MarkdownEditor } from '@/components/customs/MarkdownEditor';

export default function NewArticlePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("DESIGN");

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/journal" 
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Draft Entry.
          </h1>
        </div>
      </header>

      <form action={createArticle} className="flex flex-col gap-8">
        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Article Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Beauty of Brutalism"
              className="bg-transparent border-b border-foreground/20 py-4 text-3xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-foreground/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ArticleCategory)}
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {Object.values(ArticleCategory).map((cat) => (
                <option key={cat} value={cat} className="bg-background text-foreground uppercase tracking-widest text-xs">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reusable Markdown Editor */}
        <div className="flex flex-col gap-2">
           <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Content
            </label>
            <input type="hidden" name="content" value={content} />
            <MarkdownEditor 
              value={content} 
              onChange={setContent} 
              placeholder="# Start your story..."
            />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="self-end group relative border border-foreground/20 px-12 py-6 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] cursor-pointer overflow-hidden"
        >
          <span className="text-sm font-sans font-bold uppercase tracking-widest z-10 relative">
            Publish Entry
          </span>
        </button>
      </form>
    </div>
  );
}
