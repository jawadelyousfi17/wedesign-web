import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Download, ArrowLeft, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface FormInspectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormInspectPage({ params }: FormInspectPageProps) {
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        include: { user: true }
      },
    },
  });

  if (!form) notFound();

  const fields = form.fields as any[];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/forms" 
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Hub
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Inspect Data.
          </h1>
          <p className="text-sm text-foreground/40 font-mono uppercase tracking-widest">
            Protocol: {form.title} // {form.submissions.length} Responses
          </p>
        </div>
      </header>

      <div className="overflow-x-auto border border-foreground/20">
        <table className="w-full text-left border-collapse">
          <thead className="bg-foreground text-background uppercase text-[10px] tracking-[0.2em] font-bold">
            <tr>
              <th className="p-4 border-r border-background/10">Date</th>
              <th className="p-4 border-r border-background/10">User</th>
              {fields.map(f => (
                <th key={f.name} className="p-4 border-r border-background/10">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {form.submissions.length === 0 ? (
                <tr>
                    <td colSpan={fields.length + 2} className="p-24 text-center font-serif italic text-xl text-foreground/20 bg-card/30">
                        No data synchronized yet.
                    </td>
                </tr>
            ) : (
                form.submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#eaddcf]/30 transition-colors group">
                      <td className="p-4 border-r border-foreground/10 text-[10px] font-mono whitespace-nowrap text-foreground/40 group-hover:text-foreground">
                        {new Date(sub.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 border-r border-foreground/10 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <UserIcon size={12} className="text-foreground/30" />
                           <span className="text-xs font-bold uppercase tracking-wider">
                                {sub.user?.name || sub.user?.login1337 || "Anonymous"}
                           </span>
                        </div>
                      </td>
                      {fields.map(f => (
                        <td key={f.name} className="p-4 border-r border-foreground/10 text-sm font-sans text-foreground/70 group-hover:text-black">
                          {String((sub.data as any)[f.name] || "-")}
                        </td>
                      ))}
                    </tr>
                  ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
