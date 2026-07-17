'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props {
  projectId: string
  price: number | null
}

export function ProjectPurchaseBtn({ projectId, price }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/purchase`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Purchase failed'); return }
      if (data.already_purchased) { toast.success('You already own this!'); router.refresh(); return }
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full bg-primary text-black font-mono font-bold text-sm py-3 rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
      {user ? `Unlock for $${price}` : 'Login to Purchase'}
    </button>
  )
}
