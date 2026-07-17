'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [redirect, setRedirect] = useState('/account')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get('redirect') || '/account')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.')
      return
    }

    setIsLoading(true)
    setShowResend(false)

    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error('Supabase is not configured. Check environment variables.')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('not confirmed') || msg.includes('email not confirmed')) {
          setShowResend(true)
          toast.error('Email not confirmed — check your inbox.')
        } else if (msg.includes('invalid') || msg.includes('credentials')) {
          toast.error('Wrong email or password.')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Access granted.')
      window.location.href = redirect
    } finally {
      setIsLoading(false)
    }
  }

  const resendConfirmation = async () => {
    const supabase = createClient()
    if (!supabase) return
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    })
    if (error) { toast.error(error.message); return }
    toast.success('Confirmation email resent.')
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

        <h1 className="text-2xl font-bold text-center mb-2 font-mono uppercase">System_Login</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Enter credentials to access client portal.
        </p>

        <form onSubmit={handleSubmit} method="post" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background/50 font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-background/50 font-mono"
              required
            />
          </div>

          <Button type="submit" className="w-full font-mono mt-4" disabled={isLoading}>
            {isLoading ? 'AUTHENTICATING...' : 'ACCESS_SYSTEM'}
          </Button>
        </form>

        {showResend && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
            <p className="text-yellow-400 font-mono text-xs mb-1">EMAIL_NOT_CONFIRMED</p>
            <p className="text-muted-foreground text-xs mb-2">
              Check your inbox for the confirmation link, or resend it.
            </p>
            <button
              onClick={resendConfirmation}
              className="text-xs font-mono text-primary hover:text-primary/80 underline"
            >
              Resend confirmation email →
            </button>
          </div>
        )}

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
