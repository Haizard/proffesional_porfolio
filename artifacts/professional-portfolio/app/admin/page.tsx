'use client'

import { useEffect, useState } from 'react'
import { Activity, DollarSign, Package, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order, ContactInquiry } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, inquiries: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentInquiries, setRecentInquiries] = useState<ContactInquiry[]>([])

  useEffect(() => {
    // In a real app, fetch from specific admin aggregate endpoints
    // Here we'll simulate fetching all and calculating
    Promise.all([
      fetch('/api/orders?admin=true').then(res => res.json()).catch(() => []),
      fetch('/api/contact').then(res => res.json()).catch(() => [])
    ]).then(([ordersData, inquiriesData]) => {
      const orders = Array.isArray(ordersData) ? ordersData : []
      const inquiries = Array.isArray(inquiriesData) ? inquiriesData : []
      
      const rev = orders.reduce((sum, o) => sum + (o.total || 0), 0)
      
      setStats({ revenue: rev, orders: orders.length, inquiries: inquiries.filter(i => i.status === 'new').length })
      setRecentOrders(orders.slice(0, 5))
      setRecentInquiries(inquiries.slice(0, 5))
    })
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-mono text-primary">COMMAND_CENTER</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#0a0f1c] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 font-mono">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">${stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f1c] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 font-mono">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f1c] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 font-mono">Pending Inquiries</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.inquiries}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f1c] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 font-mono">System Status</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono text-green-400">OPTIMAL</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#0a0f1c] border-slate-800">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase">Recent Operations (Orders)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? <p className="text-slate-500 font-mono text-sm">NO_DATA</p> : recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-mono text-primary block">{order.id.slice(0,8)}</span>
                    <span className="text-slate-400">{order.customer_email}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono block">${order.total}</span>
                    <span className="text-xs uppercase text-slate-500">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f1c] border-slate-800">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase">Incoming Comms (Inquiries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInquiries.length === 0 ? <p className="text-slate-500 font-mono text-sm">NO_DATA</p> : recentInquiries.map(inquiry => (
                <div key={inquiry.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold block">{inquiry.name}</span>
                    <span className="text-slate-400 text-xs font-mono">{inquiry.service_category || 'General'}</span>
                  </div>
                  <div>
                    <span className={`text-xs uppercase px-2 py-1 rounded-sm font-mono ${inquiry.status === 'new' ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
