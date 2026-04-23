"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTeamMember(formData: FormData) {
  const name      = formData.get("name") as string;
  const role      = formData.get("role") as string;
  const login1337 = formData.get("login1337") as string | null;
  const focus     = formData.get("focus") as string | null;
  const year      = formData.get("year") as string | null;
  const avatarUrl = formData.get("avatarUrl") as string | null;
  const githubUrl = formData.get("githubUrl") as string | null;
  const bio       = formData.get("bio") as string | null;
  const tagsRaw   = formData.get("tags") as string | null;
  const tags      = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.teamMember.create({
    data: {
      name,
      role,
      login1337: login1337 || null,
      focus:     focus     || null,
      year:      year      || null,
      avatarUrl: avatarUrl || null,
      githubUrl: githubUrl || null,
      bio:       bio       || null,
      tags,
    },
  });

  revalidatePath("/team");
  revalidatePath("/");
  redirect("/admin/team");
}

export async function updateTeamMember(id: string, formData: FormData) {
  const name      = formData.get("name") as string;
  const role      = formData.get("role") as string;
  const login1337 = formData.get("login1337") as string | null;
  const focus     = formData.get("focus") as string | null;
  const year      = formData.get("year") as string | null;
  const avatarUrl = formData.get("avatarUrl") as string | null;
  const githubUrl = formData.get("githubUrl") as string | null;
  const bio       = formData.get("bio") as string | null;
  const tagsRaw   = formData.get("tags") as string | null;
  const tags      = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.teamMember.update({
    where: { id },
    data: {
      name,
      role,
      login1337: login1337 || null,
      focus:     focus     || null,
      year:      year      || null,
      avatarUrl: avatarUrl || null,
      githubUrl: githubUrl || null,
      bio:       bio       || null,
      tags,
    },
  });

  revalidatePath("/team");
  revalidatePath("/");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/team");
  revalidatePath("/");
  redirect("/admin/team");
}
