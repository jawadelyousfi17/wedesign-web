import { prisma } from "@/lib/prisma";
import Projects from "@/components/main/Projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AllProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      authors: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex flex-col gap-12 pt-12">
      {/* Mini Header / Breadcrumb */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-foreground/50 hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to surface
        </Link>
      </div>

      <Projects projects={projects} showViewAll={false} />
      
     
    </div>
  );
}
