'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal, Mail, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const redirect = searchParams?.get('redirect') || '/account'
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      })

      if (error) throw error

      // If email confirmation is disabled in Supabase, user is immediately active
      if (authData.session) {
        toast.success('Account created. Welcome!')
        window.location.href = redirect
        return
      }

      // Email confirmation required
      setRegistered(data.email)
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.')
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
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            We sent a confirmation link to <span className="text-foreground font-mono">{registered}</span>.
            Click it to activate your account, then come back and log in.
          </p>
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 border border-border rounded-sm p-3 text-left mb-6">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Didn't receive it? Check spam, or try registering again with the same email.</span>
          </div>
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
        
        <h1 className="text-2xl font-bold text-center mb-2 font-mono uppercase">New_Entity_Registration</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">Create credentials for the client portal.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register('full_name')} className="bg-background/50 font-mono" />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="bg-background/50 font-mono" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} className="bg-background/50 font-mono" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full font-mono mt-4" disabled={isLoading}>
            {isLoading ? 'INITIALIZING...' : 'CREATE_ACCOUNT'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary hover:underline font-mono">
            ACCESS_EXISTING
          </Link>
        </div>
      </div>
    </div>
  )
}
