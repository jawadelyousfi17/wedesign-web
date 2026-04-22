import { prisma } from "@/lib/prisma";
import CalendarClient from "./calendar-client";

export default async function CalendarPage() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: {
      date: "desc",
    },
  });

  return <CalendarClient initialEvents={events} />;
}
