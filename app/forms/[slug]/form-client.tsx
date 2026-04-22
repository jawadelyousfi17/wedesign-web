"use client";

import React, { useState } from 'react';
import { Form } from '@prisma/client';
import { submitForm } from '@/app/admin/forms/actions';
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';

interface FormClientProps {
  form: Form;
}

export default function FormClient({ form }: FormClientProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fields = form.fields as any[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await submitForm(form.id, formData);
      setSubmitted(true);
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-foreground/20 p-12 text-center flex flex-col items-center gap-6 bg-card">
          <CheckCircle2 size={48} className="text-green-600" />
          <h2 className="text-4xl font-serif italic tracking-tight">Data Logged.</h2>
          <p className="text-xs uppercase tracking-widest text-foreground/60 leading-relaxed">
            Your response has been successfully synchronized with our protocols.
          </p>
          <Link 
            href="/" 
            className="mt-4 border border-foreground/20 px-8 py-4 hover:bg-foreground hover:text-background transition-colors uppercase text-[10px] tracking-widest font-bold w-full"
          >
            Return to Surface
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-8 py-24 flex flex-col gap-16">
      <header className="flex flex-col gap-6 border-b border-foreground/20 pb-12">
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">Active Protocol // {form.slug}</span>
            <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] text-foreground">
                {form.title}.
            </h1>
        </div>
        <p className="text-lg text-foreground/70 max-w-xl leading-relaxed">
            {form.description}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-12">
        <div className="flex flex-col gap-0 border-t border-l border-foreground/20">
          {fields.map((field) => (
            <div key={field.id} className="group flex flex-col gap-4 p-8 border-r border-b border-foreground/20 focus-within:bg-[#eaddcf]/30 transition-colors">
              <label className="text-xs uppercase tracking-widest font-bold font-mono text-foreground/50 group-focus-within:text-foreground transition-colors flex items-center gap-2">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'TEXT' && (
                <input 
                  type="text"
                  required={field.required}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-transparent text-2xl font-serif focus:outline-none placeholder:text-foreground/5"
                  placeholder="..."
                />
              )}

              {field.type === 'LONG_TEXT' && (
                <textarea 
                  rows={4}
                  required={field.required}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-transparent text-xl font-serif focus:outline-none placeholder:text-foreground/5 resize-none"
                  placeholder="..."
                />
              )}

              {field.type === 'NUMBER' && (
                <input 
                  type="number"
                  required={field.required}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-transparent text-2xl font-serif focus:outline-none placeholder:text-foreground/5"
                  placeholder="0"
                />
              )}

              {field.type === 'DATE' && (
                <input 
                  type="date"
                  required={field.required}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-transparent text-xl font-mono focus:outline-none uppercase tracking-widest"
                />
              )}

              {field.type === 'SELECT' && (
                <select 
                  required={field.required}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-transparent text-xl font-serif focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select an option...</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative border border-foreground/20 px-12 py-8 flex items-center justify-between bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] overflow-hidden"
        >
          <span className="text-xl font-serif italic tracking-tight z-10 relative">
            Submit Protocol
          </span>
          {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
          ) : (
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
          )}
        </button>
      </form>
    </div>
  );
}
