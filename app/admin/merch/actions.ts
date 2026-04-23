"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* ── Merch Items ────────────────────────────────────────────────── */

export async function createMerchItem(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageUrlsString = formData.get("imageUrls") as string;
  const colorsString = formData.get("colors") as string;
  const sizesString = formData.get("sizes") as string;
  const isActive = formData.get("isActive") === "on";

  const images = imageUrlsString ? imageUrlsString.split(",").map((t) => t.trim()) : [];
  const colors = colorsString ? colorsString.split(",").map((t) => t.trim()) : [];
  const sizes = sizesString ? sizesString.split(",").map((t) => t.trim()) : [];

  await prisma.merchItem.create({
    data: {
      title,
      slug,
      description,
      price,
      category,
      images,
      colors,
      sizes,
      isActive,
    },
  });

  revalidatePath("/admin/merch");
  revalidatePath("/merch");
  revalidatePath("/");
  redirect("/admin/merch");
}

export async function updateMerchItem(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageUrlsString = formData.get("imageUrls") as string;
  const colorsString = formData.get("colors") as string;
  const sizesString = formData.get("sizes") as string;
  const isActive = formData.get("isActive") === "on";

  const images = imageUrlsString ? imageUrlsString.split(",").map((t) => t.trim()) : [];
  const colors = colorsString ? colorsString.split(",").map((t) => t.trim()) : [];
  const sizes = sizesString ? sizesString.split(",").map((t) => t.trim()) : [];

  await prisma.merchItem.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      price,
      category,
      images,
      colors,
      sizes,
      isActive,
    },
  });

  revalidatePath("/admin/merch");
  revalidatePath("/merch");
  revalidatePath("/");
  redirect("/admin/merch");
}

export async function deleteMerchItem(id: string) {
  await prisma.merchItem.delete({
    where: { id },
  });
  revalidatePath("/admin/merch");
  revalidatePath("/merch");
  revalidatePath("/");
}

/* ── Merch Orders ────────────────────────────────────────────────── */

export async function updateOrderStatus(id: string, status: string) {
  await prisma.merchOrder.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/merch");
}

export async function deleteMerchOrder(id: string) {
  await prisma.merchOrder.delete({
    where: { id },
  });
  revalidatePath("/admin/merch");
}
