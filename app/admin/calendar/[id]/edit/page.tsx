import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditEventClient from "./edit-client";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  return <EditEventClient event={event} />;
}
