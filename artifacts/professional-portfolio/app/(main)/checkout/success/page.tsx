'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen py-32 flex flex-col items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 font-mono">TRANSACTION_COMPLETE</h1>
        
        <div className="bg-card border border-border p-6 rounded-sm mb-8 text-left">
          <p className="text-muted-foreground mb-4">
            Order successfully processed. Our technicians will begin building your hardware immediately.
          </p>
          <div className="text-sm font-mono space-y-2 border-t border-border pt-4 text-muted-foreground">
            <p>STATUS: <span className="text-primary">PROCESSING</span></p>
            <p>RECEIPT: SENT_TO_EMAIL</p>
          </div>
        </div>

        <Link href="/account">
          <Button variant="outline" className="w-full font-mono h-12">
            VIEW_IN_CLIENT_PORTAL <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
