'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export type RegisterState = { error: string | null; success: boolean; email: string }

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const fullName = (formData.get('full_name') as string | null)?.trim() ?? ''
  const email    = (formData.get('email')     as string | null)?.trim() ?? ''
  const password = (formData.get('password')  as string | null)         ?? ''
  const next     = (formData.get('redirect')  as string | null)         ?? '/account'

  if (!fullName) return { error: 'Full name is required.',                      success: false, email }
  if (!email)    return { error: 'Email is required.',                           success: false, email }
  if (password.length < 6)
                 return { error: 'Password must be at least 6 characters.',     success: false, email }

  const headerStore = await headers()
  const origin = headerStore.get('origin') ?? headerStore.get('x-forwarded-host') ?? 'http://localhost:3000'

  const supabase = await createClient()
  if (!supabase) return { error: 'Server configuration error — contact site owner.', success: false, email }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) return { error: error.message, success: false, email }

  // Email confirmation disabled in Supabase → session already exists
  if (data.session) redirect(next)

  // Email confirmation required → show "check inbox" message
  return { error: null, success: true, email }
}
