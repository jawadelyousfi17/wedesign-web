import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteTeamMember } from "./actions";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link
            href="/admin"
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
            System Admin Panel
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Manage Crew.
          </h1>
        </div>
        <Link
          href="/admin/team/new"
          className="group relative border border-foreground/20 px-8 py-4 flex items-center justify-center bg-transparent hover:bg-[#eaddcf] transition-all duration-500 cursor-pointer overflow-hidden shrink-0"
        >
          <span className="text-sm font-sans font-bold uppercase tracking-widest text-foreground/80 group-hover:text-black transition-colors duration-500 z-10 relative pr-4">
            Add Member
          </span>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 overflow-hidden w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="absolute text-sm text-black transition-transform duration-500 -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
              →
            </span>
          </div>
        </Link>
      </header>

      {/* Table */}
      <div className="flex flex-col border border-foreground/20">
        <div className="hidden md:grid grid-cols-12 gap-4 p-5 text-xs uppercase tracking-widest text-foreground/50 border-b border-foreground/20 font-sans">
          <div className="col-span-1" />
          <div className="col-span-3">Name & Login</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Focus</div>
          <div className="col-span-2">Tags</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {members.length === 0 ? (
          <div className="p-16 text-center">
            <span className="font-serif italic text-xl text-foreground/50">
              The crew is currently empty.
            </span>
          </div>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border-b border-foreground/20 last:border-b-0 hover:bg-[#eaddcf] transition-colors duration-500 items-center"
            >
              {/* Avatar */}
              <div className="col-span-1 hidden md:flex">
                {m.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-10 h-10 object-cover rounded-full border border-foreground/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center text-sm font-serif italic text-foreground/50">
                    {m.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name & login */}
              <div className="col-span-3 flex flex-col gap-0.5">
                <h3 className="text-xl font-serif tracking-tight group-hover:text-black transition-colors leading-tight">
                  {m.name}
                </h3>
                {m.login1337 && (
                  <span className="text-xs uppercase tracking-widest text-foreground/50 group-hover:text-black/50 transition-colors">
                    @{m.login1337}
                  </span>
                )}
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className="text-xs uppercase tracking-widest border border-foreground/20 px-2 py-1 group-hover:border-black/20 group-hover:text-black transition-colors">
                  {m.role}
                </span>
              </div>

              {/* Focus */}
              <div className="col-span-2 text-sm text-foreground/70 group-hover:text-black/70 transition-colors">
                {m.focus || "—"}
                {m.year && (
                  <span className="ml-2 text-xs text-foreground/40 group-hover:text-black/40 transition-colors">
                    {m.year}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="col-span-2 flex flex-wrap gap-1">
                {(m.tags ?? []).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-1.5 py-0.5 border border-foreground/15 text-foreground/60 group-hover:border-black/15 group-hover:text-black/60 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {m.tags.length > 3 && (
                  <span className="text-[10px] text-foreground/40">
                    +{m.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex md:justify-end gap-0">
                <Link
                  href={`/admin/team/${m.id}/edit`}
                  className="flex-1 md:flex-none border border-foreground/20 border-r-0 p-4 hover:bg-foreground hover:text-background transition-colors text-xs font-sans uppercase tracking-widest text-center"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteTeamMember(m.id);
                  }}
                >
                  <button
                    type="submit"
                    className="w-full border border-foreground/20 p-4 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-xs font-sans uppercase tracking-widest"
                  >
                    Del
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
