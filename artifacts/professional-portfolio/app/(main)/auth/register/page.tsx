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
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
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
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          }
        }
      })

      if (error) throw error

      toast.success('Registration complete. System access granted.')
      router.push(redirect)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.')
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
