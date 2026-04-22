"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
       <div className="flex items-center gap-4">
         <span className="text-xs uppercase tracking-widest hidden md:inline-block">
           {user.user_metadata?.full_name || user.email}
         </span>
         <Button variant="outline" onClick={handleSignOut} className="h-8 rounded-none">
           Sign out
         </Button>
       </div>
    )
  }

  return (
    <Button onClick={handleSignIn} className="h-8 rounded-none">
       Sign in with Google
    </Button>
  )
}
