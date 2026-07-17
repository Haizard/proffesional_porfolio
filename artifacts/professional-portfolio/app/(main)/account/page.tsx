import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountContent from './AccountContent'
import type { Profile } from '@/types'

export default async function AccountPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account')

  let profile: Profile | null = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data ?? null
  } catch {
    // profiles table may not exist yet — continue without it
  }

  return <AccountContent user={user} profile={profile} />
}
