'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order } from '@/types'

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Fetch user orders. Since there's no client fetcher hook, using raw fetch
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading || !user) return <div className="min-h-screen py-24 flex justify-center"><div className="animate-pulse">LOADING_DATA...</div></div>

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2 font-mono">CLIENT_PORTAL</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="font-mono text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/30">
            <LogOut className="mr-2 h-4 w-4" /> DISCONNECT
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm uppercase">Entity_Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">{profile?.full_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <Button className="w-full font-mono mt-4">SYS_ADMIN_PANEL</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-mono text-sm uppercase">Recent_Hardware_Orders</CardTitle>
                <Link href="/account/orders" className="text-xs font-mono text-primary hover:underline">VIEW_ALL</Link>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-sm bg-background/50">
                        <div className="flex items-center gap-4">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-mono text-sm font-bold">{order.id.slice(0,8).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">${order.total}</p>
                          <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="font-mono text-sm mb-2">NO_ORDERS_FOUND</p>
                    <Link href="/store">
                      <Button variant="outline" size="sm" className="font-mono">ACCESS_STORE</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
