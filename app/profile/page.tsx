import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) return null;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-4 pb-8 border-b border-foreground/20">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">User Interface // 01</span>
        <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] text-foreground">
          Profile Settings.
        </h1>
        <p className="text-lg text-foreground/70 max-w-xl leading-relaxed">
          Update your public appearance and system identifiers.
        </p>
      </header>

      <ProfileForm user={dbUser} />
    </div>
  );
}
