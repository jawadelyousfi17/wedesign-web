import { prisma } from "@/lib/prisma";
import CalendarClient from "./calendar-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Join our upcoming crits, workshops, and jams. See what's happening at WeDesign.",
};

export default async function CalendarPage() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: {
      date: "desc",
    },
  });

  return <CalendarClient initialEvents={events} />;
}
