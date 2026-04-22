"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { updateTeamMember } from "../../actions";

const ROLES = ["President", "Vice President", "Lead Developer", "Workshops Lead", "Community", "Creative Director", "Member"];

interface Member {
  id: string;
  name: string;
  role: string;
  login1337: string | null;
  focus: string | null;
  year: string | null;
  avatarUrl: string | null;
  githubUrl: string | null;
  bio: string | null;
  tags: string[];
}

export default function EditTeamMemberPage() {
  const { id } = useParams<{ id: string }>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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

  const action = updateTeamMember.bind(null, id);

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
          Edit Member.
        </h1>
      </header>

      <form action={action} className="flex flex-col gap-10">
        <input type="hidden" name="tags" value={tags.join(",")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Full Name" id="name" name="name" required placeholder="Yassine Bouazza" />
          <Field label="1337 Login" id="login1337" name="login1337" placeholder="ybouazza" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-xs uppercase tracking-widest text-foreground/60">
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue=""
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="" disabled className="bg-background text-foreground/40">
                Select a role…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-background text-foreground">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Field label="Speciality / Focus" id="focus" name="focus" placeholder="Product Design" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Cohort Year" id="year" name="year" placeholder="C22" />
          <Field label="Avatar URL" id="avatarUrl" name="avatarUrl" type="url" placeholder="https://…/avatar.jpg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="GitHub URL" id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/username" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="text-xs uppercase tracking-widest text-foreground/60">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            placeholder="Designs systems that make complex tools feel obvious…"
            className="bg-transparent border-b border-foreground/20 py-4 text-lg font-serif text-foreground focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-foreground/20"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs uppercase tracking-widest text-foreground/60">
            Skills / Tags
          </label>
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
                <span
                  key={tag}
                  className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 border border-foreground/25 text-foreground/70"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-foreground/40 hover:text-foreground transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-foreground/20">
          <button
            type="submit"
            className="group relative border border-foreground/20 px-12 py-6 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 cursor-pointer overflow-hidden"
          >
            <span className="text-sm font-sans font-bold uppercase tracking-widest z-10 relative">
              Save Changes
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, id, name, required, placeholder, type = "text",
}: {
  label: string; id: string; name: string; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-foreground/60">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-foreground/20"
      />
    </div>
  );
}
