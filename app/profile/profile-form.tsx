"use client";

import React, { useState, useRef } from "react";
import { User } from "@prisma/client";
import { updateProfile } from "./actions";
import { uploadImage } from "@/lib/supabase/storage-actions";
import { Loader2, Camera, Check, ArrowRight } from "lucide-react";

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);
    setIsUploading(false);

    if (result.publicUrl) {
      setImageUrl(result.publicUrl);
    } else {
      alert("Failed to upload image: " + result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("image", imageUrl);

    try {
      const result = await updateProfile(formData);
      if (result?.error) {
        alert("Failed to update profile: " + result.error);
      } else {
        alert("Profile updated successfully.");
      }
    } catch (err: any) {
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left: Identity & Visuals */}
      <div className="lg:col-span-4 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <label className="text-xs uppercase tracking-widest font-bold font-mono text-foreground/40">Visual Identifier</label>
          <div className="relative group w-full aspect-square">
            <div className="w-full h-full border-2 border-foreground bg-card overflow-hidden [border-radius:42%_58%_38%_62%/51%_43%_57%_49%] group-hover:rotate-3 transition-transform duration-500">
               {imageUrl ? (
                 <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-8xl font-serif italic text-foreground/20">{(name || user.login1337)?.[0]}</span>
                 </div>
               )}
            </div>
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-4 right-4 p-4 bg-foreground text-background border border-foreground hover:bg-primary hover:text-foreground transition-all duration-300 shadow-xl"
            >
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-foreground/40 text-center">
            Click the camera icon to upload a new asset.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 border border-foreground/10 bg-card/50">
           <span className="text-[10px] uppercase tracking-widest font-bold font-mono text-foreground/40">System Metadata</span>
           <div className="flex justify-between items-center py-2 border-b border-foreground/10">
              <span className="text-xs text-foreground/60">UID</span>
              <span className="text-[10px] font-mono text-foreground/40">{user.id}</span>
           </div>
           <div className="flex justify-between items-center py-2 border-b border-foreground/10">
              <span className="text-xs text-foreground/60">Login</span>
              <span className="text-[10px] font-mono text-foreground/40">@{user.login1337}</span>
           </div>
           <div className="flex justify-between items-center py-2">
              <span className="text-xs text-foreground/60">Role</span>
              <span className="text-[10px] font-mono text-foreground/40">{user.role}</span>
           </div>
        </div>
      </div>

      {/* Right: Personalization */}
      <div className="lg:col-span-8 flex flex-col gap-10">
        <div className="flex flex-col gap-10 border-t border-l border-foreground/20">
            <div className="group flex flex-col gap-4 p-8 border-r border-b border-foreground/20 focus-within:bg-[#eaddcf]/30 transition-colors">
              <label className="text-xs uppercase tracking-widest font-bold font-mono text-foreground/50 group-focus-within:text-foreground transition-colors">
                Display Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="bg-transparent text-4xl md:text-5xl font-serif focus:outline-none placeholder:text-foreground/5"
              />
            </div>

            <div className="group flex flex-col gap-4 p-8 border-r border-b border-foreground/20 focus-within:bg-[#eaddcf]/30 transition-colors">
              <label className="text-xs uppercase tracking-widest font-bold font-mono text-foreground/50 group-focus-within:text-foreground transition-colors">
                Biographical Trace
              </label>
              <textarea 
                rows={6}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your creative practice..."
                className="bg-transparent text-xl font-serif focus:outline-none placeholder:text-foreground/5 resize-none leading-relaxed"
              />
            </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="group relative border border-foreground/20 px-12 py-8 flex items-center justify-between bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] overflow-hidden disabled:opacity-50"
        >
          <div className="flex items-center gap-4 z-10 relative">
             {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Check size={24} />}
             <span className="text-xl font-serif italic tracking-tight">
               Update Credentials
             </span>
          </div>
          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
        </button>
      </div>
    </form>
  );
}
