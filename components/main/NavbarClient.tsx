"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings, Menu, X, LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";

interface NavbarClientProps {
  user: User | null;
  isAdmin: boolean;
}

export function NavbarClient({ user, isAdmin }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="relative border-b border-foreground bg-background font-sans z-50">
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold tracking-tighter" onClick={closeMenu}>
            <span className="text-red-500"> We/</span>
            Design
          </Link>
        </div>

        {/* Center: Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Calendar
          </Link>
          <Link href="/journal" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Journal
          </Link>
          <Link href="/team" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Meet the team
          </Link>
          {isAdmin && (
            <Link href="/admin/journal" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
              <Settings size={14} />
              Admin
            </Link>
          )}
        </div>

        {/* Right: Desktop CTA & Profile */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-10 h-10 border border-foreground/20" />
              )}
              <form action={logout}>
                <Button type="submit" variant="outline" className="border-foreground/20 hover:bg-[#eaddcf] transition-colors rounded-none">
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

        {/* Mobile: Hamburger Button */}
        <div className="md:hidden flex items-center gap-4">
          {user && !isOpen && user.user_metadata?.avatar_url && (
             <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-8 h-8 border border-foreground/20" />
          )}
          <button onClick={toggleMenu} className="p-2 text-foreground focus:outline-none">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-foreground flex flex-col p-6 gap-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-lg font-medium hover:text-red-500 transition-colors" onClick={closeMenu}>
              Home
            </Link>
            <Link href="/calendar" className="text-lg font-medium hover:text-red-500 transition-colors" onClick={closeMenu}>
              Calendar
            </Link>
            <Link href="/journal" className="text-lg font-medium hover:text-red-500 transition-colors" onClick={closeMenu}>
              Journal
            </Link>
            <Link href="/team" className="text-lg font-medium hover:text-red-500 transition-colors" onClick={closeMenu}>
              Meet the team
            </Link>
            {isAdmin && (
              <Link href="/admin/journal" className="text-lg font-bold text-red-500 flex items-center gap-2" onClick={closeMenu}>
                <Settings size={18} />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-foreground/10">
            {user ? (
               <form action={logout} className="w-full">
                  <Button type="submit" variant="outline" className="w-full justify-between rounded-none border-foreground/20 h-12">
                    Logout
                    <LogOut size={18} />
                  </Button>
               </form>
            ) : (
              <Link href="/login" className="w-full" onClick={closeMenu}>
                <Button variant={"outline"} className="w-full rounded-none border-foreground/20 h-12">
                  Login
                </Button>
              </Link>
            )}
            <Link href="/join" className="w-full" onClick={closeMenu}>
              <Button variant={"default"} className="w-full rounded-none h-12 justify-between">
                Join we/design
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
