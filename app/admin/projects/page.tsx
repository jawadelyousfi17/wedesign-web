import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteProject } from "./actions";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { authors: true },
  });

  return (
    <div className="flex flex-col gap-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
            System Admin Panel
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Showcase.
          </h1>
        </div>

        <Link
          href="/admin/projects/new"
          className="group relative border border-foreground/20 px-8 py-4 flex items-center justify-center bg-transparent hover:bg-[#eaddcf] transition-all duration-500 ease-[0.22,1,0.36,1] cursor-pointer overflow-hidden flex-shrink-0"
        >
          <span className="text-sm font-sans font-bold uppercase tracking-widest text-foreground/80 group-hover:text-black transition-colors duration-500 z-10 relative pr-4">
            add project
          </span>
          {/* Animated Arrow */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 overflow-hidden w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="absolute text-sm text-black transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
               →
             </span>
          </div>
        </Link>
      </header>

      {/* Grid Layout of Projects */}
      <div className="flex flex-col border border-foreground/20 bg-transparent">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-8 p-6 text-xs uppercase tracking-widest text-foreground/50 border-b border-foreground/20 font-sans">
           <div className="col-span-5">Project & Authors</div>
           <div className="col-span-2">Type</div>
           <div className="col-span-3">Featured</div>
           <div className="col-span-2 text-right">Actions</div>
        </div>

        {projects.length === 0 ? (
          <div className="p-16 text-center border-b border-foreground/20">
             <span className="font-serif italic text-2xl text-foreground/50">
                The shipyard is currently empty.
             </span>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 p-6 border-b border-foreground/20 last:border-b-0 transition-colors duration-500 hover:bg-[#eaddcf] items-center"
            >
              {/* Info Column */}
              <div className="col-span-5 flex flex-col gap-2">
                 <h3 className="text-2xl md:text-3xl font-serif tracking-tight group-hover:text-black transition-colors duration-500 leading-none">
                    {project.title}
                 </h3>
                 <span className="text-[10px] font-sans uppercase tracking-widest text-foreground/50 group-hover:text-black/50 transition-colors">
                    By {project.authors.map(a => a.name || a.login1337).join(", ") || "Unknown"}
                 </span>
              </div>
              
              {/* Tags/Type */}
              <div className="col-span-2 flex flex-wrap gap-1">
                 {project.tags.slice(0, 2).map(tag => (
                   <span key={tag} className="text-[8px] font-sans uppercase tracking-widest border border-foreground/20 px-1 py-0.5 group-hover:border-black/20 group-hover:text-black transition-colors">
                      {tag}
                   </span>
                 ))}
              </div>

              {/* Status / Featured */}
              <div className="col-span-3 text-xs font-sans uppercase tracking-widest text-foreground/50 group-hover:text-black/50 transition-colors">
                 {project.isFeatured ? "★ FEATURED" : "STANDARD"}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex md:justify-end gap-0">
                 <Link 
                   href={`/admin/projects/${project.id}/edit`} 
                   className="flex-1 md:flex-none border border-foreground/20 border-r-0 md:border-r border-transparent md:border-foreground/20 p-4 hover:bg-foreground hover:text-background transition-colors text-xs font-sans uppercase tracking-widest text-center"
                 >
                   Edit
                 </Link>
                 <form action={async () => {
                    "use server";
                    await deleteProject(project.id);
                 }} className="contents">
                    <button 
                      className="flex-1 md:flex-none border border-foreground/20 p-4 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-xs font-sans uppercase tracking-widest text-center"
                    >
                      Del
                    </button>
                 </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
