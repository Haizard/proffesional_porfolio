'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
    }
  }, [user])

  if (loading || !user) return <div className="min-h-screen py-24 flex justify-center"><div className="animate-pulse">LOADING_DATA...</div></div>

  const statusColors = {
    pending: 'secondary',
    paid: 'outline',
    processing: 'default', // primary
    shipped: 'outline',
    delivered: 'outline',
    cancelled: 'danger'
  } as const

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/account" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-12 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_PORTAL
        </Link>

        <h1 className="text-4xl font-bold tracking-tighter mb-12 font-mono">ORDER_HISTORY</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-sm">
            <p className="font-mono text-muted-foreground mb-4">NO_TRANSACTION_LOGS</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border border-border rounded-sm bg-card overflow-hidden">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex h-12 w-12 bg-primary/10 rounded items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-lg mb-1">{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <p className="font-mono font-bold text-lg">{formatPrice(order.total)}</p>
                    </div>
                    <Badge variant={statusColors[order.status] || 'secondary'} className="uppercase font-mono w-24 justify-center">
                      {order.status}
                    </Badge>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="p-6 pt-0 border-t border-border mt-2 bg-background/30">
                    <h4 className="font-mono font-bold text-sm mb-4 mt-6">MANIFEST</h4>
                    <div className="space-y-4">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground font-mono">{item.quantity}x</span>
                            <span>{item.product_name}</span>
                          </div>
                          <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {order.shipping_address && (
                      <>
                        <h4 className="font-mono font-bold text-sm mb-4 mt-8">SHIPPING_DESTINATION</h4>
                        <div className="text-sm text-muted-foreground bg-muted p-4 rounded border border-border">
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
