'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type LoginState = { error: string | null }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email    = (formData.get('email')    as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null)?.trim() ?? ''
  const next     = (formData.get('redirect') as string | null)       ?? '/account'

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  if (!supabase) return { error: 'Server configuration error — contact site owner.' }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('not confirmed') || msg.includes('email not confirmed'))
      return { error: 'Your email is not confirmed yet. Check your inbox for the confirmation link.' }
    if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('wrong'))
      return { error: 'Wrong email or password. Please try again.' }
    return { error: error.message }
  }

  redirect(next)
}
