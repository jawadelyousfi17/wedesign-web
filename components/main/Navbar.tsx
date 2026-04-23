import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/auth/actions";
import NavbarClient from "./navbar-client";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
  }

  const isAdmin = dbUser?.role === "ADMIN";

  return (
    <NavbarClient
      user={
        user
          ? {
              id: user.id,
              name:
                (user.user_metadata?.full_name as string) ||
                (user.user_metadata?.name as string) ||
                user.email?.split("@")[0] ||
                "Member",
              email: user.email ?? "",
              avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
            }
          : null
      }
      isAdmin={isAdmin}
      logoutAction={logout}
    />
  );
}
