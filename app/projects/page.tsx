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
    <div className="flex flex-col gap-12 pt-3 md:pt-12">
      {/* Mini Header / Breadcrumb removed */}

      <Projects projects={projects} showViewAll={false} />
      
     
    </div>
  );
}
