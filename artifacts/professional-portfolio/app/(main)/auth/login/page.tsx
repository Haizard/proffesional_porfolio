'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get('redirect') || '/account'
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      toast.success('Access granted.')
      router.push(redirect)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
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
        <p className="text-center text-muted-foreground mb-8 text-sm">Enter credentials to access client portal.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="bg-background/50 font-mono" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Forgot?</Link>
            </div>
            <Input id="password" type="password" {...register('password')} className="bg-background/50 font-mono" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full font-mono mt-4" disabled={isLoading}>
            {isLoading ? 'AUTHENTICATING...' : 'ACCESS_SYSTEM'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href={`/auth/register?redirect=${encodeURIComponent(redirect)}`} className="text-primary hover:underline font-mono">
            REGISTER_NEW
          </Link>
        </div>
      </div>
    </div>
  )
}
