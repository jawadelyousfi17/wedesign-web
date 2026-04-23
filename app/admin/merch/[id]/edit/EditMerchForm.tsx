"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { updateMerchItem } from '../../actions';
import { uploadImage } from '@/lib/supabase/storage-actions';
import { Camera, Loader2, X, ArrowLeft, Plus } from 'lucide-react';
import { MerchItem } from '@prisma/client';

export default function EditMerchForm({ item }: { item: MerchItem }) {
  const [title, setTitle] = useState(item.title);
  const [slug, setSlug] = useState(item.slug);
  const [imageUrls, setImageUrls] = useState<string[]>(item.images);
  const [uploading, setUploading] = useState(false);
  
  // Parse existing colors
  const [colors, setColors] = useState<{label: string, hex: string}[]>(
    item.colors.map(c => {
      const [label, hex] = c.split(':');
      return { label: label.trim(), hex: hex?.trim() || "#000000" };
    })
  );

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
      setImageUrls(prev => [...prev, result.publicUrl as string]);
    } else {
      alert("Upload failed: " + (result.error || "Unknown error"));
    }
    setUploading(false);
  };

  const addColor = () => setColors([...colors, { label: "", hex: "#000000" }]);
  const removeColor = (idx: number) => setColors(colors.filter((_, i) => i !== idx));
  const updateColor = (idx: number, field: 'label' | 'hex', value: string) => {
    const newColors = [...colors];
    newColors[idx][field] = value;
    setColors(newColors);
  };

  const updateWithId = updateMerchItem.bind(null, item.id);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/merch" 
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Supply
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Refine Gear.
          </h1>
        </div>
      </header>

      <form action={updateWithId} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Item Title</label>
            <input type="text" name="title" required value={title} onChange={handleTitleChange} className="bg-transparent border-b border-foreground/20 py-4 text-3xl font-serif text-foreground focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Slug</label>
            <input type="text" name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Price (MAD)</label>
            <input type="number" name="price" required defaultValue={item.price} className="bg-transparent border-b border-foreground/20 py-4 text-xl font-mono text-foreground focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Category</label>
            <input type="text" name="category" defaultValue={item.category || ""} className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex items-center gap-4 py-4">
             <input type="checkbox" name="isActive" id="isActive" defaultChecked={item.isActive} className="w-5 h-5 accent-foreground" />
             <label htmlFor="isActive" className="text-xs uppercase tracking-widest text-foreground/60 font-mono cursor-pointer">Live in Store</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Sizes (comma separated)</label>
            <input type="text" name="sizes" defaultValue={item.sizes.join(', ')} className="bg-transparent border-b border-foreground/20 py-4 font-mono text-foreground focus:outline-none focus:border-accent transition-colors" />
          </div>
          
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Color Palette</label>
            <input type="hidden" name="colors" value={colors.map(c => `${c.label}:${c.hex}`).join(',')} />
            <div className="flex flex-col gap-3">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-4 bg-foreground/[0.02] p-2 border border-foreground/10">
                   <input 
                     type="color" 
                     value={c.hex} 
                     onChange={(e) => updateColor(i, 'hex', e.target.value)}
                     className="w-10 h-10 bg-transparent cursor-pointer"
                   />
                   <input 
                     type="text" 
                     placeholder="Color Name" 
                     value={c.label}
                     onChange={(e) => updateColor(i, 'label', e.target.value)}
                     className="bg-transparent border-b border-foreground/10 py-1 text-sm font-serif flex-1 focus:outline-none focus:border-accent"
                   />
                   <button type="button" onClick={() => removeColor(i)} className="p-2 text-red-500 hover:bg-red-50 transition-colors">
                     <X size={16} />
                   </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addColor}
                className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-foreground/10 text-foreground/40 hover:border-accent hover:text-accent transition-all text-xs font-mono uppercase"
              >
                <Plus size={14} /> Add Color Variant
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Description</label>
          <textarea name="description" rows={3} defaultValue={item.description || ""} className="bg-transparent border border-foreground/20 p-4 font-serif text-foreground focus:outline-none focus:border-accent transition-colors" />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Gallery (Order matches Color variants)</label>
          <input type="hidden" name="imageUrls" value={imageUrls.join(',')} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square border border-foreground/10 overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] px-1 font-mono">IMG {i}</div>
                <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors">
              {uploading ? <Loader2 className="animate-spin text-accent" /> : <Camera className="text-foreground/20" />}
              <span className="text-[10px] uppercase font-mono mt-2 text-foreground/40">Add Image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
        </div>

        <button type="submit" className="self-end px-12 py-6 bg-foreground text-background text-sm font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-foreground transition-all duration-500">
          Save Changes
        </button>
      </form>
    </div>
  );
}
