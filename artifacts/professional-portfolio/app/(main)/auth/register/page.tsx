'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal, Mail } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [redirect, setRedirect] = useState('/account')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get('redirect') || '/account')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) { toast.error('Full name is required.'); return }
    if (!email.trim())    { toast.error('Email is required.'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return }

    setIsLoading(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error('Supabase is not configured. Check environment variables.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      })

      if (error) { toast.error(error.message); return }

      // Email confirmation disabled in Supabase → session exists immediately
      if (data.session) {
        toast.success('Account created. Welcome!')
        window.location.href = redirect
        return
      }

      // Email confirmation required
      setRegistered(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-md bg-card border border-border p-8 rounded-sm shadow-2xl relative text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3 font-mono uppercase">Check_Your_Email</h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-foreground font-mono">{email}</span>.
            Click it to activate your account, then log in.
          </p>
          <Link href="/auth/login">
            <Button className="w-full font-mono bg-primary text-black hover:bg-primary/90">
              GO_TO_LOGIN
            </Button>
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

        <h1 className="text-2xl font-bold text-center mb-2 font-mono uppercase">
          New_Entity_Registration
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Create credentials for the client portal.
        </p>

        <form onSubmit={handleSubmit} method="post" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              autoComplete="name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="bg-background/50 font-mono"
              required
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-background/50 font-mono"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full font-mono mt-4" disabled={isLoading}>
            {isLoading ? 'INITIALIZING...' : 'CREATE_ACCOUNT'}
          </Button>
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
