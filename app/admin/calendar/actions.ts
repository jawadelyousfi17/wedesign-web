"use server";

import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as EventStatus;

  await prisma.calendarEvent.create({
    data: {
      title,
      date: new Date(dateStr),
      type,
      location,
      description,
      status,
    },
  });

  redirect("/admin/calendar");
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as EventStatus;

  await prisma.calendarEvent.update({
    where: { id },
    data: {
      title,
      date: new Date(dateStr),
      type,
      location,
      description,
      status,
    },
  });

  redirect("/admin/calendar");
}
