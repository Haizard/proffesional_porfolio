'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Terminal, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { registerAction, type RegisterState } from './actions'

const initial: RegisterState = { error: null, success: false, email: '' }

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initial)

  if (state.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-md bg-card border border-border p-8 rounded-sm shadow-2xl relative text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3 font-mono uppercase tracking-tight">
            Check_Your_Email
          </h1>
          <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
            A confirmation link was sent to:
          </p>
          <p className="text-foreground font-mono text-sm mb-6 break-all">{state.email}</p>
          <p className="text-muted-foreground text-xs mb-6">
            Click the link in that email to activate your account, then log in here.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex w-full h-10 items-center justify-center rounded-sm bg-primary px-4 text-sm font-mono font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            GO_TO_LOGIN
          </Link>
        </div>
      </div>
    )
  }

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
          New_Entity_Registration
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Create credentials for the client portal.
        </p>

        {state.error && (
          <div className="mb-4 flex gap-2 items-start p-3 rounded-sm bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-mono">{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value="/account" />

          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              className="flex h-10 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

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
              autoComplete="new-password"
              required
              minLength={6}
              className="flex h-10 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 h-10 px-4 py-2 inline-flex items-center justify-center rounded-sm text-sm font-mono font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> INITIALIZING...</>
            ) : 'CREATE_ACCOUNT'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-mono">
            ACCESS_EXISTING
          </Link>
        </div>
      </div>
    </div>
  )
}
