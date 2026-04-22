"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleInterest(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to show interest." };
  }

  // Check if user already interested
  const existingInterest = await prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      interestedUsers: {
        some: {
          id: user.id,
        },
      },
    },
  });

  if (existingInterest) {
    // Remove interest
    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        interestedUsers: {
          disconnect: { id: user.id },
        },
      },
    });
  } else {
    // Add interest
    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        interestedUsers: {
          connect: { id: user.id },
        },
      },
    });
  }

  revalidatePath(`/calendar/${eventId}`);
  return { success: true };
}
