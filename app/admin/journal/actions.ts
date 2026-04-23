"use server";

import { prisma } from "@/lib/prisma";
import { ArticleCategory } from "@prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  await prisma.article.create({
    data: {
      title,
      slug,
      content,
      category,
      authorId: user.id,
      publishedAt: new Date(),
    },
  });

  revalidatePath("/journal");
  revalidatePath("/");
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

  revalidatePath("/journal");
  revalidatePath("/");
  redirect("/admin/journal");
}
