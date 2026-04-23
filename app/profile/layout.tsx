import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex-1 w-full relative">
      {/* Paper Margin Lines */}
      <div className="absolute top-0 bottom-0 left-[2rem] md:left-[4rem] w-px bg-red-400/30 z-0 hidden md:block pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[4.25rem] w-px bg-red-400/30 z-0 hidden md:block pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto md:pl-24 px-4 md:px-8 py-16">
        {children}
      </div>
    </main>
  );
}
