"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createForm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const fieldsJson = formData.get("fields") as string;
  const fields = JSON.parse(fieldsJson);

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  await prisma.form.create({
    data: {
      title,
      slug,
      description,
      fields,
    },
  });

  revalidatePath("/admin/forms");
  redirect("/admin/forms");
}

export async function submitForm(formId: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await prisma.formSubmission.create({
    data: {
      formId,
      data,
      userId: user?.id || null,
    },
  });

  revalidatePath(`/forms/[slug]`, 'page');
  return { success: true };
}

export async function deleteForm(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.form.delete({
        where: { id }
    });

    revalidatePath("/admin/forms");
}
