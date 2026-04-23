"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const demoUrl = formData.get("demoUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const tagsString = formData.get("tags") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const authorIdsString = formData.get("authorIds") as string;

  const tags = tagsString ? tagsString.split(",").map((t) => t.trim()) : [];
  const authorIds = authorIdsString ? authorIdsString.split(",").map((id) => id.trim()) : [];

  await prisma.project.create({
    data: {
      title,
      slug,
      description,
      content,
      imageUrl,
      demoUrl,
      githubUrl,
      tags,
      isFeatured,
      authors: {
        connect: authorIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const demoUrl = formData.get("demoUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const tagsString = formData.get("tags") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const authorIdsString = formData.get("authorIds") as string;

  const tags = tagsString ? tagsString.split(",").map((t) => t.trim()) : [];
  const authorIds = authorIdsString ? authorIdsString.split(",").map((id) => id.trim()) : [];

  await prisma.project.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      content,
      imageUrl,
      demoUrl,
      githubUrl,
      tags,
      isFeatured,
      authors: {
        set: authorIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}
