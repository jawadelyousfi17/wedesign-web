import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { logout } from "@/app/auth/actions";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      <div className="wd-nav-links ">
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
