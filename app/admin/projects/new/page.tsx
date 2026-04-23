import { prisma } from "@/lib/prisma";
import NewProjectForm from "./NewProjectForm";

export default async function NewProjectPage() {
  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { name: 'asc' }
  });

  return <NewProjectForm teamMembers={teamMembers} />;
}
