import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return (
      <main className="flex-1 w-full flex items-center justify-center py-16 px-4 md:px-8 relative">
          {/* Paper Margin Lines */}
        <div className="absolute top-0 bottom-0 left-[2rem] md:left-[4rem] w-px bg-red-400/30 z-0 hidden md:block pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[4.25rem] w-px bg-red-400/30 z-0 hidden md:block pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg border border-foreground/20 p-8 md:p-12 text-center flex flex-col items-center gap-6 bg-transparent">
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
            Error 403
          </span>
          <h1 className="text-4xl md:text-5xl font-serif italic text-red-600 tracking-tight leading-tight">
            Access Denied.
          </h1>
          <p className="text-xs uppercase tracking-widest text-foreground/80 leading-relaxed">
            You do not have administrative privileges to access the crew board.
          </p>
          <Link 
            href="/" 
            className="mt-4 border border-foreground/20 px-8 py-4 hover:bg-[#eaddcf] hover:text-black transition-colors uppercase text-xs tracking-widest font-bold font-sans w-full inline-flex justify-center"
          >
            Return to Surface
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full relative">
      {/* Paper Margin Lines */}
      {/* <div className="absolute top-0 bottom-0 left-[2rem] md:left-[4rem] w-px bg-red-400/30 z-0 hidden md:block pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[4.25rem] w-px bg-red-400/30 z-0 hidden md:block pointer-events-none"></div> */}
      
      <div className="relative z-10 w-full max-w-7xl mx-auto bg-card px-4 md:px-8 py-16">
        {children}
      </div>
    </main>
  );
}
