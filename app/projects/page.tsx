import { prisma } from "@/lib/prisma";
import Projects from "@/components/main/Projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of high-end digital products, experiments, and aesthetics crafted at 1337 UM6P.",
};

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
