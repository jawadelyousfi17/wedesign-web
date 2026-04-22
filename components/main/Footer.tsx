"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Crew", href: "#crew" },
  { label: "Projects", href: "#projects" },
  { label: "Calendar", href: "#calendar" },
  { label: "Journal", href: "#journal" },
  { label: "Apply", href: "#apply" },
];

const Footer: React.FC = () => {
  return (
    <footer className="pt-16 pb-8 px-8 bg-foreground text-background" id="contact">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
          
          {/* Left Col: Branding & Navs */}
          <div className="flex flex-col justify-between gap-12">
             <div className="flex flex-col gap-4">
               <h2 className="text-6xl md:text-8xl font-semibold tracking-tight">
                 we/design
               </h2>
               <p className="text-background/60 font-sans text-xs uppercase tracking-widest max-w-sm leading-relaxed">
                 Where design meets the terminal. A student-run club based at 1337 Coding School blending code and brutalist aesthetics.
               </p>
             </div>
             
             {/* Nav Links */}
             <nav className="grid grid-cols-2 gap-y-4 gap-x-8 w-fit mb-8">
                {NAV_LINKS.map((link) => (
                   <Link 
                     key={link.label} 
                     href={link.href} 
                     className="group flex items-center gap-3 text-sm font-sans uppercase tracking-widest text-background/80 hover:text-primary transition-colors duration-300"
                    >
                      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-lg leading-none">
                        →
                      </span>
                      <span className="-translate-x-4 group-hover:translate-x-0 transition-transform duration-300">
                        {link.label}
                      </span>
                   </Link>
                ))}
             </nav>

             {/* Sponsors */}
             <div className="flex flex-col gap-2 mt-auto">
                <span className="text-xs font-sans uppercase tracking-widest text-background/50">
                   Proudly Sponsored By
                </span>
                <div className="flex gap-6 items-center flex-wrap">
                   <span className="text-2xl font-sans font-bold tracking-tighter text-background/80">1337</span>
                   <span className="text-2xl font-sans font-bold tracking-tighter text-background/80">UM6P</span>
                </div>
             </div>
          </div>

          {/* Right Col: Contact Form */}
          <div className="border border-background/20 p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden">
             <h3 className="text-4xl font-serif italic text-background">
               Drop us a line.
             </h3>
             <form className="flex flex-col gap-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                     <label htmlFor="contact-name" className="text-xs uppercase tracking-widest text-background/60 font-mono transition-colors focus-within:text-primary">
                       Name
                     </label>
                     <input 
                       type="text" 
                       id="contact-name" 
                       placeholder="John Doe" 
                       className="bg-transparent border-b border-background/20 py-2 text-2xl font-serif text-background focus:outline-none focus:border-primary transition-colors placeholder:text-background/20" 
                     />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label htmlFor="contact-email" className="text-xs uppercase tracking-widest text-background/60 font-mono transition-colors focus-within:text-primary">
                       Email
                     </label>
                     <input 
                       type="email" 
                       id="contact-email" 
                       placeholder="hello@example.com" 
                       className="bg-transparent border-b border-background/20 py-2 text-2xl font-serif text-background focus:outline-none focus:border-primary transition-colors placeholder:text-background/20" 
                     />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                   <label htmlFor="contact-msg" className="text-xs uppercase tracking-widest text-background/60 font-mono transition-colors focus-within:text-primary">
                     Message
                   </label>
                   <textarea 
                     id="contact-msg" 
                     placeholder="What's on your mind?" 
                     rows={3} 
                     className="bg-transparent border-b border-background/20 py-2 text-2xl font-serif text-background focus:outline-none focus:border-primary transition-colors placeholder:text-background/20 resize-none w-full" 
                   />
                </div>
                
               <Button  type="submit" className="self-start w-full h-12">
                 Send Message
               </Button>
             </form>
          </div>
       </div>

       {/* Footer Bottom Meta */}
       <div className="mt-16 pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[0.65rem] uppercase tracking-widest text-background/40">
          <span>© 2026 we/design. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-background transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-background transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-background transition-colors">X / Twitter</Link>
          </div>
       </div>
    </footer>
  );
};

export default Footer;