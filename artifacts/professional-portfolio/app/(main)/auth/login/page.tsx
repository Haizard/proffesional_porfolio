'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Terminal, AlertCircle, Loader2 } from 'lucide-react'
import { loginAction, type LoginState } from './actions'

const initial: LoginState = { error: null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initial)

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-24 px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-sm shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Terminal className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 font-mono uppercase tracking-tight">
          System_Login
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Enter credentials to access client portal.
        </p>

        {state.error && (
          <div className="mb-4 flex gap-2 items-start p-3 rounded-sm bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-mono">{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Pass redirect through the form so the server action can read it */}
          <input type="hidden" name="redirect" value="/account" />

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="flex h-10 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="flex h-10 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 h-10 px-4 py-2 inline-flex items-center justify-center rounded-sm text-sm font-mono font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AUTHENTICATING...</>
            ) : 'ACCESS_SYSTEM'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-mono">
            REGISTER_NEW
          </Link>
        </div>
      </div>
    </div>
  )
}
