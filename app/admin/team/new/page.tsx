"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { createTeamMember } from "../actions";
import { uploadImage } from "@/lib/supabase/storage-actions";

const ROLES = ["President", "Vice President", "Lead Developer", "Workshops Lead", "Community", "Creative Director", "Member", "Alumni"];

export default function NewTeamMemberPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImage(fd);

    setUploading(false);
    if (result.error) {
      setUploadError(result.error);
      setAvatarPreview("");
    } else if (result.publicUrl) {
      setAvatarUrl(result.publicUrl);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-4 pb-8 border-b border-foreground/20">
        <Link
          href="/admin/team"
          className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Crew
        </Link>
        <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
          Add Member.
        </h1>
      </header>

      <form action={createTeamMember} className="flex flex-col gap-10">
        <input type="hidden" name="tags" value={tags.join(",")} />
        <input type="hidden" name="avatarUrl" value={avatarUrl} />

        {/* Avatar upload */}
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-foreground/60">Avatar</span>
          <div className="flex items-center gap-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 border border-foreground/20 hover:border-foreground/60 transition-colors cursor-pointer overflow-hidden shrink-0 group"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                  <span className="text-2xl text-foreground/30">+</span>
                  <span className="text-[10px] uppercase tracking-widest text-foreground/40">Upload</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-foreground/60 animate-pulse">
                    Uploading…
                  </span>
                </div>
              )}
              {avatarUrl && !uploading && (
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 py-1 flex justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-background">✓ Saved</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs uppercase tracking-widest border border-foreground/20 px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit"
              >
                {uploading ? "Uploading…" : "Choose Image"}
              </button>
              <span className="text-xs text-foreground/40">PNG, JPG, WEBP — recommended square</span>
              {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
            </div>
          </div>
        </div>

        {/* Name & Login */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Full Name" id="name" name="name" required placeholder="Yassine Bouazza" />
          <Field label="1337 Login" id="login1337" name="login1337" placeholder="ybouazza" />
        </div>

        {/* Role & Speciality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-xs uppercase tracking-widest text-foreground/60">Role</label>
            <select
              id="role"
              name="role"
              required
              defaultValue=""
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="" disabled className="bg-background text-foreground/40">Select a role…</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-background text-foreground">{r}</option>
              ))}
            </select>
          </div>
          <Field label="Speciality / Focus" id="focus" name="focus" placeholder="Product Design" />
        </div>

        {/* Year & GitHub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Cohort Year" id="year" name="year" placeholder="C22" />
          <Field label="GitHub URL" id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/username" />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="text-xs uppercase tracking-widest text-foreground/60">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            placeholder="Designs systems that make complex tools feel obvious…"
            className="bg-transparent border-b border-foreground/20 py-4 text-lg font-serif text-foreground focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-foreground/20"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-3">
          <label className="text-xs uppercase tracking-widest text-foreground/60">Skills / Tags</label>
          <div className="flex items-center gap-3 border-b border-foreground/20 pb-4">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="React, Figma, GSAP — press Enter to add"
              className="flex-1 bg-transparent py-3 text-base font-serif text-foreground focus:outline-none placeholder:text-foreground/20"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-xs uppercase tracking-widest border border-foreground/20 px-4 py-2 hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 border border-foreground/25 text-foreground/70">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-foreground/40 hover:text-foreground transition-colors leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-4 border-t border-foreground/20">
          <button
            type="submit"
            disabled={uploading}
            className="border border-foreground/20 px-12 py-6 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-sans font-bold uppercase tracking-widest">Add to Crew</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, id, name, required, placeholder, type = "text" }: {
  label: string; id: string; name: string; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-foreground/60">{label}</label>
      <input
        type={type} id={id} name={name} required={required} placeholder={placeholder}
        className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-foreground/20"
      />
    </div>
  );
}
