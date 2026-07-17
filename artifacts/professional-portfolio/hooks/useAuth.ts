'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data ?? null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) { setLoading(false); return }

    // ── 1. Eagerly load the current session from cookies ──────────────────
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setProfile(await fetchProfile(supabase, u.id))
      setLoading(false)
    })

    // ── 2. Keep state in sync on sign-in / sign-out / token refresh ───────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip the INITIAL_SESSION echo — getSession() already handled it
        if (event === 'INITIAL_SESSION') return

        const u = session?.user ?? null
        setUser(u)
        if (u) {
          setProfile(await fetchProfile(supabase, u.id))
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return { user, profile, loading, isAdmin: profile?.role === 'admin', signOut }
}
