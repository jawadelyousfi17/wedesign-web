import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-background">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          WeDesign
        </Link>
      </div>

      {/* Center: Nav Items */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/manifesto" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Manifesto
        </Link>
        <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Events
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
      </div>

      {/* Right: CTA Button */}
      <div className="flex items-center">
        <Button asChild>
          <Link href="/join">Join</Link>
        </Button>
      </div>
    </nav>
  );
}
