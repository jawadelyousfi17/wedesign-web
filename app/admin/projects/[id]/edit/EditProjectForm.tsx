"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { updateProject } from '../../actions';
import { Project, TeamMember } from '@prisma/client';
import { uploadImage } from '@/lib/supabase/storage-actions';
import { Camera, Loader2, X } from 'lucide-react';

interface ProjectWithAuthors extends Project {
  authors: TeamMember[];
}

export default function EditProjectForm({ 
  project, 
  teamMembers 
}: { 
  project: ProjectWithAuthors; 
  teamMembers: TeamMember[] 
}) {
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    project.authors.map(a => a.id)
  );
  const [imageUrl, setImageUrl] = useState(project.imageUrl || "");
  const [uploading, setUploading] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);
    if (result.publicUrl) {
      setImageUrl(result.publicUrl);
    } else {
      alert("Upload failed: " + (result.error || "Unknown error"));
    }
    setUploading(false);
  };

  const updateProjectWithId = updateProject.bind(null, project.id);

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/projects" 
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Shipyard
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Refine Ship.
          </h1>
        </div>
      </header>

      <form action={updateProjectWithId} className="flex flex-col gap-8">
        {/* Image Upload Section */}
        <div className="flex flex-col gap-4">
          <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
            Project Image
          </label>
          <input type="hidden" name="imageUrl" value={imageUrl} />
          
          <div className="relative group w-full aspect-[21/9] border border-foreground/20 bg-foreground/[0.02] overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <>
                <img 
                  src={imageUrl} 
                  alt="Project Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-4 right-4 p-2 bg-background border border-foreground/20 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 border border-foreground/10 flex items-center justify-center rounded-full bg-background group-hover:border-primary transition-colors">
                  {uploading ? <Loader2 className="animate-spin text-primary" /> : <Camera className="text-foreground/40" />}
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/60">Upload Cover</span>
                   <span className="text-[10px] text-foreground/30 font-mono mt-1">PNG, JPG up to 5MB</span>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={title}
              onChange={handleTitleChange}
              className="bg-transparent border-b border-foreground/20 py-4 text-3xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Slug (URL)
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
            Short Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={project.description || ""}
            className="bg-transparent border border-foreground/20 p-4 font-sans text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* URLs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="demoUrl" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Live Demo URL
            </label>
            <input
              type="text"
              id="demoUrl"
              name="demoUrl"
              defaultValue={project.demoUrl || ""}
              className="bg-transparent border-b border-foreground/20 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="githubUrl" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              GitHub URL
            </label>
            <input
              type="text"
              id="githubUrl"
              name="githubUrl"
              defaultValue={project.githubUrl || ""}
              className="bg-transparent border-b border-foreground/20 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label htmlFor="tags" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              defaultValue={project.tags.join(', ')}
              className="bg-transparent border-b border-foreground/20 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-4 py-4">
             <input 
               type="checkbox" 
               id="isFeatured" 
               name="isFeatured" 
               defaultChecked={project.isFeatured}
               className="w-4 h-4 border-foreground/20 rounded-none bg-transparent accent-foreground"
             />
             <label htmlFor="isFeatured" className="text-xs uppercase tracking-widest text-foreground/60 font-mono cursor-pointer">
                Mark as Featured Project
             </label>
          </div>
        </div>

        {/* Authors */}
        <div className="flex flex-col gap-4">
           <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Project Authors
           </label>
           <input type="hidden" name="authorIds" value={selectedAuthors.join(',')} />
           <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => {
                    setSelectedAuthors(prev => 
                      prev.includes(member.id) 
                        ? prev.filter(id => id !== member.id)
                        : [...prev, member.id]
                    );
                  }}
                  className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-colors ${
                    selectedAuthors.includes(member.id)
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-foreground/20 text-foreground/50 hover:border-foreground/50'
                  }`}
                >
                  {member.name || member.login1337}
                </button>
              ))}
           </div>
        </div>

        {/* Long Content */}
        <div className="flex flex-col gap-2">
          <label htmlFor="content" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
            Detailed Content (Optional)
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            defaultValue={project.content || ""}
            className="bg-transparent border border-foreground/20 p-4 font-sans text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="self-end group relative border border-foreground/20 px-12 py-6 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] cursor-pointer overflow-hidden"
        >
          <span className="text-sm font-sans font-bold uppercase tracking-widest z-10 relative">
            Update Project
          </span>
        </button>
      </form>
    </div>
  );
}
