import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    publishedCount,
    draftCount,
    upcomingCount,
    applicationCount,
    recentArticles,
    upcomingEvents,
  ] = await Promise.all([
    prisma.article.count({ where: { publishedAt: { not: null } } }),
    prisma.article.count({ where: { publishedAt: null } }),
    prisma.calendarEvent.count({ where: { status: "UPCOMING" } }),
    prisma.joinApplication.count({ where: { status: "PENDING" } }),
    prisma.article.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
    prisma.calendarEvent.findMany({
      take: 3,
      where: { status: "UPCOMING" },
      orderBy: { date: "asc" },
    }),
  ]);

  const adminName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Admin";
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(today).toUpperCase();

  return (
    <div className="flex flex-col gap-16">

      {/* Header */}
      <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20 overflow-hidden">
        {/* decorative watermark */}
        <span className="pointer-events-none select-none absolute -right-6 -bottom-8 text-[12rem] font-serif italic leading-none text-foreground/5 hidden md:block">
          ✦
        </span>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
            System Admin Panel
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Command Desk.
          </h1>
          <p className="text-base font-serif italic text-foreground/70 max-w-md leading-relaxed">
            Welcome back, {adminName}. Here are the shortcuts and the current state of the publication.
          </p>
        </div>
        <div className="flex flex-col gap-1 md:items-end text-xs font-sans uppercase tracking-widest text-foreground/50">
          <span>Signed in as</span>
          <span className="font-serif italic text-base text-foreground normal-case tracking-normal">
            {adminName}
          </span>
          <span className="mt-1 text-xs">{formattedDate}</span>
        </div>
      </header>

      {/* Stats — inverted block for visual contrast */}
      <section className="grid grid-cols-2 md:grid-cols-4 bg-foreground text-background">
        <StatCell label="Published" value={publishedCount} sub="entries" />
        <StatCell label="In Draft" value={draftCount} sub="entries" />
        <StatCell label="Upcoming" value={upcomingCount} sub="events" />
        <StatCell label="Pending" value={applicationCount} sub="applications" />
      </section>

      {/* Shortcuts */}
      <section className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between pb-4 border-b border-foreground/20">
          <h2 className="text-4xl font-serif italic">Shortcuts.</h2>
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50">
            Most-used actions
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-r border-b border-foreground/20">
          {[
            { href: "/admin/journal",     kicker: "Journal · 01", title: "Manage Entries",   desc: "Review, edit, or unpublish existing articles across every section." },
            { href: "/admin/journal/new", kicker: "Journal · 02", title: "Write New Entry",  desc: "Compose and publish a new article with markdown support." },
            { href: "/admin/calendar",    kicker: "Calendar · 01",title: "Manage Events",    desc: "Edit upcoming workshops, meetups, and launches." },
            { href: "/admin/calendar/new",kicker: "Calendar · 02",title: "Create New Event", desc: "Schedule a fresh entry on the public agenda." },
            { href: "/admin/team",        kicker: "People · 01",  title: "Manage Crew",      desc: "Add, edit, or remove team members from the public roster." },
            { href: "/admin/team/new",    kicker: "People · 02",  title: "Add Member",       desc: "Add a new crew member with their role, skills, and bio." },
            { href: "/",                  kicker: "Exit",          title: "Return to Surface",desc: "Leave the admin panel and go back to the public site." },
          ].map((s, i) => (
            <Shortcut key={s.href} index={i + 1} {...s} />
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

        {/* Latest entries */}
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between pb-4 border-b border-foreground/20">
            <h2 className="text-3xl font-serif italic">Latest Entries.</h2>
            <Link
              href="/admin/journal"
              className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="flex flex-col border border-foreground/20">
            {recentArticles.length === 0 ? (
              <EmptyRow text="The journal is currently void." />
            ) : (
              recentArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/journal/${a.id}/edit`}
                  className="group flex items-center justify-between gap-4 p-5 border-b border-foreground/20 last:border-b-0 hover:bg-[#eaddcf] transition-colors duration-500"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${a.publishedAt ? "bg-green-500" : "bg-foreground/25"}`} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3 className="text-xl font-serif tracking-tight truncate group-hover:text-black transition-colors">
                        {a.title}
                      </h3>
                      <span className="text-xs uppercase tracking-widest text-foreground/50 group-hover:text-black/50 transition-colors">
                        {a.author.name} · {a.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-foreground/50 group-hover:text-black/50 whitespace-nowrap transition-colors border border-foreground/10 px-2 py-0.5 group-hover:border-black/20 shrink-0">
                    {a.publishedAt ? "Live" : "Draft"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between pb-4 border-b border-foreground/20">
            <h2 className="text-3xl font-serif italic">Next on Agenda.</h2>
            <Link
              href="/admin/calendar"
              className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="flex flex-col border border-foreground/20">
            {upcomingEvents.length === 0 ? (
              <EmptyRow text="The agenda is currently void." />
            ) : (
              upcomingEvents.map((e) => {
                const eventDate = new Date(e.date);
                const day = eventDate.getDate().toString().padStart(2, "0");
                const month = eventDate
                  .toLocaleString("en-US", { month: "short" })
                  .toUpperCase();
                return (
                  <Link
                    key={e.id}
                    href={`/admin/calendar/${e.id}/edit`}
                    className="group flex items-center gap-6 p-5 border-b border-foreground/20 last:border-b-0 hover:bg-[#eaddcf] transition-colors duration-500"
                  >
                    <div className="flex flex-col items-center justify-center w-14 shrink-0 bg-foreground/5 group-hover:bg-black/10 transition-colors py-3 rounded-sm">
                      <span className="text-4xl font-serif tracking-tighter leading-none group-hover:text-black transition-colors">
                        {day}
                      </span>
                      <span className="text-xs uppercase tracking-widest text-foreground/50 mt-1 group-hover:text-black/50 transition-colors">
                        {month}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <h3 className="text-xl font-serif tracking-tight truncate group-hover:text-black transition-colors">
                        {e.title}
                      </h3>
                      <span className="text-xs uppercase tracking-widest text-foreground/50 group-hover:text-black/50 transition-colors">
                        {e.type}{e.location ? ` · ${e.location}` : ""}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="border-t border-l border-background/10 p-6 md:p-8 flex flex-col gap-3">
      <span className="text-xs font-sans uppercase tracking-widest text-background/50">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-6xl md:text-7xl font-serif italic tracking-tight leading-none">
          {value.toString().padStart(2, "0")}
        </span>
        <span className="text-xs font-sans uppercase tracking-widest text-background/50">
          {sub}
        </span>
      </div>
    </div>
  );
}

function Shortcut({
  href,
  kicker,
  title,
  desc,
  index,
}: {
  href: string;
  kicker: string;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <Link
      href={href}
      className="group relative border-t border-l border-foreground/20 p-6 md:p-8 flex flex-col gap-4 min-h-60 hover:bg-[#eaddcf] transition-colors duration-500 ease-[0.22,1,0.36,1] cursor-pointer overflow-hidden"
    >
      {/* ghost index number */}
      <span className="pointer-events-none select-none absolute -bottom-6 -right-3 text-[7rem] font-serif italic leading-none text-foreground/5 group-hover:text-black/5 transition-colors duration-500">
        {index.toString().padStart(2, "0")}
      </span>
      <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 group-hover:text-black/60 transition-colors duration-500">
        {kicker}
      </span>
      <h3 className="text-4xl font-serif tracking-tight leading-tight mt-auto group-hover:text-black group-hover:pl-2 transition-all duration-500 ease-[0.22,1,0.36,1]">
        {title}
      </h3>
      <p className="text-base text-foreground/70 leading-relaxed group-hover:text-black/75 transition-colors duration-500">
        {desc}
      </p>
      <div className="absolute top-6 right-6 overflow-hidden w-6 h-6 flex items-center justify-center">
        <span className="absolute text-2xl text-foreground/50 transition-transform duration-500 ease-[0.22,1,0.36,1] group-hover:translate-x-full group-hover:-translate-y-full">
          →
        </span>
        <span className="absolute text-2xl text-black transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
          →
        </span>
      </div>
    </Link>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="p-10 text-center">
      <span className="font-serif italic text-xl text-foreground/50">{text}</span>
    </div>
  );
}
