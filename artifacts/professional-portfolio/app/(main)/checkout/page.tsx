'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(2, 'Name is required'),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const { items, total } = useCart()
  const { user, profile } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  useEffect(() => {
    if (user) {
      setValue('email', user.email || '')
      setValue('name', profile?.full_name || '')
    }
  }, [user, profile, setValue])

  const onSubmit = async (data: FormData) => {
    setIsProcessing(true)
    try {
      // In a real app, this calls /api/checkout to get a Stripe session ID
      // and redirects to Stripe Checkout. For this build, we simulate success.
      toast.success('Initiating secure payment gateway...')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to success page for demo purposes
      router.push('/checkout/success')
      
    } catch (error) {
      toast.error('Transaction failed to initialize.')
      setIsProcessing(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tighter mb-12 font-mono">
          SECURE_CHECKOUT
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="bg-card border border-border p-6 rounded-sm mb-8">
              <h2 className="font-mono font-bold mb-6 border-b border-border pb-4">CLIENT_INFO</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register('email')} 
                    className="bg-background/50" 
                    readOnly={!!user}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    {...register('name')} 
                    className="bg-background/50" 
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-sm p-6 sticky top-24">
              <h3 className="font-mono font-bold text-lg mb-6 border-b border-border pb-4">ORDER_SUMMARY</h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-muted-foreground font-mono text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span className="font-mono text-xl text-primary">{formatPrice(total())}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                className="w-full font-mono h-12 text-lg bg-white text-black hover:bg-gray-200 shadow-none hover:shadow-none" 
                disabled={isProcessing}
              >
                {isProcessing ? 'PROCESSING...' : 'PAY_WITH_STRIPE'}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
                ENCRYPTED_CONNECTION
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
