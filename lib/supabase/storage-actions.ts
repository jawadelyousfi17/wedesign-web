"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadImage(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Auth check - recommended for storage uploads
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file || !file.name) {
      return { error: "No valid file provided" };
    }

    // Generate a unique file name
    const fileExt = file.name.split(".").pop();
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("public_images")
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return { error: error.message };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("public_images")
      .getPublicUrl(filePath);

    return { publicUrl };
  } catch (error: any) {
    console.error("Upload image error:", error);
    return { error: error?.message || "An unexpected error occurred during upload." };
  }
}
