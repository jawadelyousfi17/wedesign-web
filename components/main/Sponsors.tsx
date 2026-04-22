import React from 'react';

export default function Sponsors() {
  return (
    <section className="relative w-full border-t border-b border-foreground/20 bg-[#fdfaf5] py-16 md:py-24 overflow-hidden">
      {/* Paper Margin Lines */}
      <div className="absolute top-0 bottom-0 left-[2rem] md:left-[4rem] w-px bg-red-400/30 z-0 hidden md:block"></div>
      <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[4.25rem] w-px bg-red-400/30 z-0 hidden md:block"></div>

      <div className="relative z-10 max-w-7xl mx-auto md:pl-24">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 px-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
              Partners
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-foreground">
              Proudly Supported By
            </h2>
          </div>

          {/* Sponsors Grid */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-8 pr-4">
            {/* 1337 */}
            <a 
              href="https://1337.ma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative border border-foreground/20 px-12 py-8 flex items-center justify-center bg-transparent hover:bg-[#eaddcf] transition-all duration-500 ease-[0.22,1,0.36,1] overflow-hidden"
            >
              {/* Animated Arrow */}
              <div className="absolute top-4 right-4 overflow-hidden w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute text-sm text-black transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
                  →
                </span>
              </div>
              <span className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-foreground/80 group-hover:text-black transition-colors duration-500">
                1337
              </span>
            </a>
            
            {/* UM6P */}
            <a 
              href="https://um6p.ma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative border border-foreground/20 px-12 py-8 flex items-center justify-center bg-transparent hover:bg-[#eaddcf] transition-all duration-500 ease-[0.22,1,0.36,1] overflow-hidden"
            >
               {/* Animated Arrow */}
               <div className="absolute top-4 right-4 overflow-hidden w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute text-sm text-black transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
                  →
                </span>
              </div>
              <span className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-foreground/80 group-hover:text-black transition-colors duration-500">
                UM6P
              </span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
