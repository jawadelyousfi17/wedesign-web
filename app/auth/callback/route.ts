import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      
      // Upsert the user into Prisma (creates if not exists, updates if exists)
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || null,
          image: user.user_metadata?.avatar_url || null,
        },
        create: {
          id: user.id, // Match Supabase UUID
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || null,
          image: user.user_metadata?.avatar_url || null,
        },
      })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}