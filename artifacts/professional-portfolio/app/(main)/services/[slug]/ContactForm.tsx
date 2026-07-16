'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message is required'),
})

type FormData = z.infer<typeof schema>

export function ContactForm({ serviceCategory, serviceName }: { serviceCategory: string, serviceName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: `I am interested in deploying ${serviceName} for my business. Please contact me with more details.`
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          service_category: serviceCategory,
          subject: `Inquiry: ${serviceName}`
        })
      })
      
      if (!res.ok) throw new Error('Submission failed')
      
      toast.success('Inquiry transmitted. Awaiting response.')
      reset()
    } catch (error) {
      toast.error('Transmission failed. Try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name / ID</Label>
        <Input id="name" {...register('name')} className="bg-background/50" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Comm Link (Email)</Label>
        <Input id="email" type="email" {...register('email')} className="bg-background/50" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Organization</Label>
        <Input id="company" {...register('company')} className="bg-background/50" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Parameters</Label>
        <Textarea 
          id="message" 
          rows={4} 
          {...register('message')} 
          className="bg-background/50 resize-none" 
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>
      
      <Button type="submit" className="w-full font-mono mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'TRANSMITTING...' : 'INITIALIZE_CONTACT'}
      </Button>
    </form>
  )
}
