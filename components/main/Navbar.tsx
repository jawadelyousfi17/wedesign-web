import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/auth/actions";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
  }

  const isAdmin = dbUser?.role === "ADMIN";

  return (
    <nav className="flex items-center justify-between px-6 py-2 border-b border-foreground bg-background font-sans">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold tracking-tighter">
         
          <span className="text-red-500"> We/</span>
          Design
        </Link>
      </div>

      {/* Center: Nav Items */}
      <div className="wd-nav-links flex items-center gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </Link>
    
        <Link
          href="/calendar"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Calendar
        </Link>

        <Link
          href="/journal"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Journal
        </Link>

        <Link
          href="/team"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Meet the team
        </Link>

        {isAdmin && (
          <Link
            href="/admin/journal"
            className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <Settings size={14} />
            Admin
          </Link>
        )}
      </div>

      {/* Right: CTA Button */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            {user.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="User Avatar" 
               
                className="w-10 h-10  border border-foreground/20"
              />
            )}
            <form action={logout}>
              <Button type="submit" variant="outline" className="border-foreground/20 hover:bg-[#eaddcf] transition-colors rounded-none hidden md:inline-flex">
                Logout
              </Button>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <Button variant={"outline"} className="border-foreground/20 hover:bg-[#eaddcf] transition-colors rounded-none">
              Login
            </Button>
          </Link>
        )}
        
        <Link href="/join">
          <Button variant={"default"} className="rounded-none">
            Join
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </nav>
  );
}
