'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a no-op proxy when credentials are not yet configured
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(url, key)
}
