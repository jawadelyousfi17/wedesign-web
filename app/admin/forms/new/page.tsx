"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, GripVertical, Settings2 } from "lucide-react";
import { createForm } from '../actions';

type FieldType = 'TEXT' | 'LONG_TEXT' | 'SELECT' | 'NUMBER' | 'DATE';

interface FormField {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For SELECT
}

export default function NewFormPage() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: "New Field",
      name: `field_${fields.length + 1}`,
      type: 'TEXT',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/forms" 
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Hub
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Draft Protocol.
          </h1>
        </div>
      </header>

      <form action={createForm} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Form Metadata */}
        <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Title</label>
                <input 
                    name="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Application Form"
                    className="bg-transparent border-b border-foreground/20 py-4 text-3xl font-serif focus:outline-none focus:border-primary transition-colors"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">Description</label>
                <textarea 
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Instructions for participants."
                    className="bg-transparent border border-foreground/10 p-4 text-sm font-sans focus:outline-none focus:border-primary transition-colors resize-none"
                />
            </div>

            <div className="mt-8 p-6 border border-foreground/10 bg-card/50">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Settings2 size={14} />
                    Configuration
                </h4>
                <p className="text-[10px] text-foreground/40 leading-relaxed uppercase tracking-wider">
                    Slug will be generated as: <br/>
                    <span className="text-foreground/60 font-mono">/forms/{title.toLowerCase().replace(/\s+/g, '-')}</span>
                </p>
            </div>
        </div>

        {/* Right: Field Builder */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest font-bold font-mono text-foreground/60">Fields Schema</h3>
                <button 
                    type="button"
                    onClick={addField}
                    className="flex items-center gap-2 px-4 py-2 border border-foreground/20 hover:bg-foreground hover:text-background transition-colors text-[10px] uppercase tracking-widest font-bold"
                >
                    <Plus size={14} />
                    Add Entry Point
                </button>
            </div>

            <input type="hidden" name="fields" value={JSON.stringify(fields)} />

            <div className="flex flex-col gap-0 border border-foreground/20">
                {fields.length === 0 ? (
                    <div className="p-12 text-center bg-[#fdfaf5]/30">
                        <span className="text-xs uppercase tracking-widest text-foreground/30 font-mono">Zero entry points defined.</span>
                    </div>
                ) : (
                    fields.map((field, index) => (
                        <div key={field.id} className="group grid grid-cols-12 gap-4 p-6 border-b border-foreground/20 last:border-b-0 hover:bg-[#eaddcf]/30 transition-colors">
                            <div className="col-span-1 flex items-center justify-center text-foreground/20">
                                <GripVertical size={20} />
                            </div>
                            
                            <div className="col-span-5 flex flex-col gap-2">
                                <input 
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    className="bg-transparent text-xl font-serif focus:outline-none placeholder:text-foreground/10"
                                    placeholder="Label"
                                />
                                <span className="text-[10px] font-mono text-foreground/30 uppercase">KEY: {field.name}</span>
                            </div>

                            <div className="col-span-3 flex items-center">
                                <select 
                                    value={field.type}
                                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                                    className="bg-transparent border border-foreground/10 p-2 text-[10px] uppercase tracking-widest font-bold w-full focus:outline-none"
                                >
                                    <option value="TEXT">Short Text</option>
                                    <option value="LONG_TEXT">Long Text</option>
                                    <option value="NUMBER">Number</option>
                                    <option value="DATE">Date</option>
                                    <option value="SELECT">Selection</option>
                                </select>
                            </div>

                            <div className="col-span-2 flex items-center justify-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        className="accent-foreground"
                                    />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40">Req.</span>
                                </label>
                            </div>

                            <div className="col-span-1 flex items-center justify-end">
                                <button 
                                    type="button"
                                    onClick={() => removeField(field.id)}
                                    className="p-2 text-foreground/20 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {field.type === 'SELECT' && (
                                <div className="col-span-11 col-start-2 mt-4">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 mb-2 block">Options (Comma separated)</label>
                                    <input 
                                        value={field.options?.join(', ') || ''}
                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Yes, No, Maybe"
                                        className="w-full bg-transparent border border-foreground/10 p-3 text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <button
                type="submit"
                disabled={fields.length === 0}
                className="mt-8 group relative border border-foreground/20 px-12 py-6 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] disabled:opacity-50"
            >
                <span className="text-sm font-sans font-bold uppercase tracking-widest">
                    Initialize Protocol
                </span>
            </button>
        </div>
      </form>
    </div>
  );
}
