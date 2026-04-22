"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadImage(formData: FormData) {
  const supabase = await createClient();
  
  // Auth check - recommended for storage uploads
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  // Generate a unique file name
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = fileName;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    return { error: error.message };
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("public_images")
    .getPublicUrl(filePath);

  return { publicUrl };
}
