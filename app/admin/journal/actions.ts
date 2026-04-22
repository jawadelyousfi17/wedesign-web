"use server";

import { prisma } from "@/lib/prisma";
import { ArticleCategory } from "@prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as ArticleCategory;
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Find a team member associated with this user or just use a default one for now
  // In a real app, you'd link User to TeamMember
  let teamMember = await prisma.teamMember.findFirst({
    where: { name: user.user_metadata?.full_name || "Admin" }
  });

  if (!teamMember) {
    teamMember = await prisma.teamMember.create({
      data: {
        name: user.user_metadata?.full_name || "Admin",
        role: "Admin",
      }
    });
  }

  await prisma.article.create({
    data: {
      title,
      slug,
      content,
      category,
      authorId: teamMember.id,
      publishedAt: new Date(),
    },
  });

  redirect("/admin/journal");
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as ArticleCategory;
  
  await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
      category,
    },
  });

  redirect("/admin/journal");
}
