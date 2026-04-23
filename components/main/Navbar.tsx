"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout, getUserRole } from "@/app/auth/actions";
import NavbarClient from "./navbar-client";

export function Navbar() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const u = session.user;
          setUser({
            id: u.id,
            name:
              (u.user_metadata?.full_name as string) ||
              (u.user_metadata?.name as string) ||
              u.email?.split("@")[0] ||
              "Member",
            email: u.email ?? "",
            avatarUrl: (u.user_metadata?.avatar_url as string) ?? null,
          });

          // Fetch role safely via server action
          const role = await getUserRole();
          setIsAdmin(role === "ADMIN");
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setIsAdmin(false);
        } else if (session?.user) {
          const u = session.user;
          setUser({
            id: u.id,
            name:
              (u.user_metadata?.full_name as string) ||
              (u.user_metadata?.name as string) ||
              u.email?.split("@")[0] ||
              "Member",
            email: u.email ?? "",
            avatarUrl: (u.user_metadata?.avatar_url as string) ?? null,
          });
          const role = await getUserRole();
          setIsAdmin(role === "ADMIN");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Optionally return a minimal placeholder or null while loading to prevent layout shift
  if (isLoading) {
    return <NavbarClient user={null} isAdmin={false} logoutAction={logout} />;
  }

  return (
    <NavbarClient
      user={user}
      isAdmin={isAdmin}
      logoutAction={logout}
    />
  );
}
