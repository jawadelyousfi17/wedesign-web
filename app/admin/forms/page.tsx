import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, Trash2 } from "lucide-react";
import { deleteForm } from "./actions";

export default async function AdminFormsPage() {
  const forms = await prisma.form.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        _count: {
            select: { submissions: true }
        }
    }
  });

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
            Manager
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Form Hub.
          </h1>
        </div>

        <Link
          href="/admin/forms/new"
          className="group relative border border-foreground/20 px-8 py-4 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] flex-shrink-0"
        >
          <Plus size={18} className="mr-2" />
          <span className="text-sm font-sans font-bold uppercase tracking-widest">
            new form
          </span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-foreground/20">
        {forms.length === 0 ? (
          <div className="col-span-full p-24 text-center border-b border-r border-foreground/20 bg-card">
            <p className="font-serif italic text-2xl text-foreground/30">
              No active protocols found.
            </p>
          </div>
        ) : (
          forms.map((form) => (
            <div 
              key={form.id} 
              className="group flex flex-col justify-between p-8 border-r border-b border-foreground/20 hover:bg-[#eaddcf] transition-colors duration-500"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-foreground/40 border border-foreground/10 px-2">
                        {form.isActive ? 'Active' : 'Archived'}
                    </span>
                    <span className="text-[10px] font-mono text-foreground/40">
                        {form._count.submissions} Submissions
                    </span>
                </div>
                <h3 className="text-3xl font-serif tracking-tight leading-tight group-hover:text-black transition-colors">
                  {form.title}
                </h3>
                <p className="text-sm text-foreground/60 line-clamp-2 leading-relaxed">
                  {form.description || "Experimental data collection form."}
                </p>
              </div>

              <div className="mt-12 flex items-center gap-0 border border-foreground/10">
                <Link 
                  href={`/admin/forms/${form.id}`}
                  className="flex-1 flex items-center justify-center gap-2 p-3 hover:bg-foreground hover:text-background transition-colors border-r border-foreground/10 text-[10px] uppercase tracking-widest font-bold"
                >
                  <Eye size={14} />
                  Inspect
                </Link>
                <Link 
                  href={`/forms/${form.slug}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 p-3 hover:bg-foreground hover:text-background transition-colors border-r border-foreground/10 text-[10px] uppercase tracking-widest font-bold"
                >
                  Visit
                </Link>
                <form action={deleteForm.bind(null, form.id)} className="flex-none">
                    <button className="p-3 hover:bg-red-600 hover:text-white transition-colors text-foreground/40 hover:text-white">
                        <Trash2 size={14} />
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
