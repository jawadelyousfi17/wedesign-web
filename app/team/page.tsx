import { prisma } from "@/lib/prisma";
import { MemberCard } from "./MemberCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Crew",
  description: "Meet the designers, developers, and makers behind WeDesign. A student-run club at 1337 UM6P.",
};

export default async function CrewPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-7xl bg-card mx-auto w-full relative py-16">
      <div className="relative z-10 px-8 pr-4">
        <header className="mb-20">
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-none mb-8">
            Meet the Team behind we/design.
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl leading-relaxed">
            We are designers, developers, and makers who believe that standard Web 2.0 aesthetics are boring. We build tools, host workshops, and experiment with the intersection of typography, code, and brutalism.
          </p>
        </header>

        {members.length === 0 ? (
          <div className="py-24 text-center border border-foreground/20">
            <span className="font-serif italic text-2xl text-foreground/40">The crew is assembling…</span>
          </div>
        ) : (
          <div className="border-t border-l border-foreground columns-1 md:columns-2 lg:columns-3 gap-0 bg-card overflow-hidden">
            {members.map((member, i) => (
              <MemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
