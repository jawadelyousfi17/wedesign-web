"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Code, 
  List, 
  Eye, 
  Edit3,
  Loader2
} from "lucide-react";
import { uploadImage } from "@/lib/supabase/storage-actions";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing your story..." 
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);

    onChange(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);
    setIsUploading(false);

    if (result.publicUrl) {
      insertText(`![${file.name}](${result.publicUrl})`);
    } else {
      alert("Failed to upload image: " + result.error);
    }
  };

  const toolbarItems = [
    { icon: <Heading1 size={18} />, action: () => insertText("# ", ""), label: "H1" },
    { icon: <Heading2 size={18} />, action: () => insertText("## ", ""), label: "H2" },
    { icon: <Bold size={18} />, action: () => insertText("**", "**"), label: "Bold" },
    { icon: <Italic size={18} />, action: () => insertText("*", "*"), label: "Italic" },
    { icon: <LinkIcon size={18} />, action: () => insertText("[", "](url)"), label: "Link" },
    { icon: <ImageIcon size={18} />, action: () => fileInputRef.current?.click(), label: "Image" },
    { icon: <Code size={18} />, action: () => insertText("```\n", "\n```"), label: "Code" },
    { icon: <List size={18} />, action: () => insertText("- ", ""), label: "List" },
  ];

  return (
    <div className="flex flex-col border border-foreground/20 bg-[#fdfaf5]/50 overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-foreground/10 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          {toolbarItems.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={item.action}
              disabled={isPreview || isUploading}
              className="p-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
              title={item.label}
            >
              {isUploading && item.label === "Image" ? <Loader2 size={18} className="animate-spin" /> : item.icon}
            </button>
          ))}
        </div>

        <div className="flex border border-foreground/20">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors ${!isPreview ? 'bg-foreground text-background' : 'hover:bg-foreground/5'}`}
          >
            <Edit3 size={14} />
            Write
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors ${isPreview ? 'bg-foreground text-background' : 'hover:bg-foreground/5'}`}
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative min-h-[500px]">
        {!isPreview ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[500px] p-8 bg-transparent text-lg font-mono leading-relaxed focus:outline-none resize-none placeholder:text-foreground/10"
          />
        ) : (
          <div className="p-8 prose prose-neutral max-w-none markdown-body h-full min-h-[500px]">
            <ReactMarkdown>{value || "*Nothing to preview yet...*"}</ReactMarkdown>
          </div>
        )}
      </div>

      <style jsx global>{`
        .markdown-body {
          font-family: var(--font-sans);
          color: var(--foreground);
        }
        .markdown-body p {
          font-size: 1.15rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: var(--font-serif);
          line-height: 1.2;
          margin-top: 2rem;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
        }
        .markdown-body h1 { font-size: 2.5rem; }
        .markdown-body h2 { font-size: 2rem; }
        .markdown-body h3 { font-size: 1.5rem; }
        
        .markdown-body blockquote {
          border-left: 4px solid var(--foreground);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-style: italic;
          color: var(--foreground/80);
        }
        .markdown-body ul {
          list-style-type: square;
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .markdown-body pre {
          background: var(--foreground);
          color: var(--background);
          padding: 1.5rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          margin: 1.5rem 0;
          border-radius: 0;
        }
        .markdown-body img {
          max-width: 100%;
          height: auto;
          border: 1px solid var(--foreground/10);
          margin: 2rem 0;
        }
        .markdown-body code {
          background: var(--foreground/5);
          padding: 0.2rem 0.4rem;
          font-size: 0.9em;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
};
