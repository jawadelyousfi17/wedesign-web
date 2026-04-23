"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Settings,
  ArrowRight,
  ArrowUpRight,
  LogOut,
  User as UserIcon,
  Search,
} from "lucide-react";

type NavUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

interface NavbarClientProps {
  user: NavUser | null;
  isAdmin: boolean;
  logoutAction: () => void | Promise<void>;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Lab", href: "/lab" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Merch", href: "/merch" },
  { label: "Calendar", href: "/calendar" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
  { label: "Crew", href: "/team" },
];

export default function NavbarClient({
  user,
  isAdmin,
  logoutAction,
}: NavbarClientProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* scroll state — adds shadow past 20px */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* close user dropdown on outside click or Escape */
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 border-b-2 border-foreground bg-background/90 backdrop-blur-sm transition-shadow ${
          scrolled ? "shadow-[0_4px_0_-1px_var(--color-foreground)]" : ""
        }`}
      >
        <div className="w-full px-4 md:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
          {/* ── LOGO ─────────────────────────────────────────────── */}
          <Link
            href="/"
            className="group flex items-center font-serif text-xl md:text-2xl font-semibold tracking-tight leading-none shrink-0"
          >
            <span>we</span>
            <span className="text-accent italic mx-0.5 group-hover:rotate-12 inline-block transition-transform duration-300">
              /
            </span>
            <span>design</span>
          </Link>

          {/* ── DESKTOP NAV ─────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm text-foreground transition-colors"
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={
                      active
                        ? "text-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    }
                  >
                    {link.label}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 -bottom-1 h-0.5 bg-accent"
                    />
                  )}
                </Link>
              );
            })}

            {/* Command Palette Trigger */}
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-command-palette"))
              }
              className="flex items-center gap-2 px-2.5 py-1.5 border border-foreground/10 hover:border-foreground/30 bg-foreground/5 hover:bg-foreground/10 transition-all text-foreground/50 hover:text-foreground rounded group/search"
              title="Search (Ctrl+K)"
            >
              <Search
                size={14}
                className="group-hover/search:scale-110 transition-transform"
              />
              <div className="hidden lg:flex items-center gap-1 font-mono text-[10px] opacity-60">
                <kbd className="min-w-[1.5em] text-center uppercase">Cmd</kbd>
                <span>K</span>
              </div>
            </button>

            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm flex items-center gap-1.5 text-foreground/70 hover:text-accent transition-colors border border-foreground/30 hover:border-accent px-2 py-1"
                aria-current={isActive("/admin") ? "page" : undefined}
              >
                <Settings size={12} />
                Admin
              </Link>
            )}
          </div>

          {/* ── DESKTOP CTA ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 border-2 border-foreground hover:bg-primary transition-colors px-2 py-1 h-10"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 object-cover [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]"
                    />
                  ) : (
                    <span className="w-7 h-7 bg-primary border border-foreground flex items-center justify-center text-sm font-serif italic text-primary-foreground [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-semibold max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 border-2 border-foreground bg-card shadow-[6px_6px_0_var(--color-foreground)] z-50"
                  >
                    <div className="px-4 py-3 border-b-2 border-foreground/15">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-foreground/60 truncate font-serif italic">
                        {user.email}
                      </div>
                    </div>
                    <Link
                      href={`/team/${user.id}`}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
                    >
                      <UserIcon size={14} />
                      Your profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
                      >
                        <Settings size={14} />
                        Admin panel
                      </Link>
                    )}
                    <form action={logoutAction} className="border-t-2 border-foreground/15">
                      <button
                        type="submit"
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/join"
              className="group relative h-10 inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors px-4 text-sm font-semibold"
            >
              Join
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* ── MOBILE TRIGGER ───────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-10 h-10 border-2 border-foreground flex items-center justify-center hover:bg-primary transition-colors ml-auto"
            aria-label="Open menu"
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  MOBILE OVERLAY MENU                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          {/* backdrop */}
          <div
            aria-hidden
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-200"
          />

          {/* sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-x-0 top-0 z-50 md:hidden flex flex-col bg-background border-b-2 border-foreground animate-in slide-in-from-top duration-300 max-h-screen overflow-y-auto"
          >
            {/* header with close */}
            <div className="flex items-center justify-between px-4 h-14 border-b-2 border-foreground shrink-0">
              <span className="font-serif text-xl font-semibold tracking-tight">
                we<span className="text-accent italic mx-0.5">/</span>design
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 border-2 border-foreground flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* nav */}
            <div className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center justify-between gap-2 py-4 text-3xl font-serif tracking-tight border-b border-foreground/15 transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight
                      size={18}
                      className={`transition-opacity ${
                        active ? "text-accent opacity-100" : "opacity-40"
                      }`}
                    />
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between gap-2 py-4 text-xl font-serif tracking-tight text-foreground/80 hover:text-accent transition-colors border-b border-foreground/15"
                >
                  <span className="flex items-center gap-2">
                    <Settings size={16} />
                    Admin panel
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              )}
            </div>

            {/* user / auth */}
            <div className="mt-auto p-4 border-t-2 border-foreground flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 border-2 border-foreground object-cover [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]"
                      />
                    ) : (
                      <span className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center font-serif italic text-primary-foreground [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-foreground/60 truncate font-serif italic">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full border-2 border-foreground bg-card hover:bg-primary transition-colors py-3 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-full border-2 border-foreground bg-card hover:bg-primary transition-colors py-3 text-sm font-semibold flex items-center justify-center"
                >
                  Sign in
                </Link>
              )}

              <Link
                href="/join"
                className="w-full border-2 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                Join the crew
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
