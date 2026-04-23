"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  return dbUser?.role;
}
