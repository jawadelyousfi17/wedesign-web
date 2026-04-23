import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProjectForm from "./EditProjectForm";

export default async function EditProjectPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { authors: true }
  });

  if (!project) {
    notFound();
  }

  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { name: 'asc' }
  });

  return <EditProjectForm project={project} teamMembers={teamMembers} />;
}
