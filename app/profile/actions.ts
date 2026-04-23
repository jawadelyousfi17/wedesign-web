"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as string;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        image,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return { error: error?.message || "Failed to update profile." };
  }
}
