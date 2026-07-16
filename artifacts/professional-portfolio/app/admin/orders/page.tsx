'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  
  useEffect(() => {
    fetch('/api/orders?admin=true')
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
  }, [])

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error()
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Status updated.')
    } catch {
      toast.error('Update failed.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">ORDER_LOGISTICS</h1>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400">
            <tr>
              <th className="p-4 font-normal">ID / DATE</th>
              <th className="p-4 font-normal">CUSTOMER</th>
              <th className="p-4 font-normal">TOTAL</th>
              <th className="p-4 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-800/30">
                <td className="p-4">
                  <div className="font-bold font-mono text-primary">{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-slate-500 font-mono text-xs">{new Date(order.created_at).toLocaleDateString()}</div>
                </td>
                <td className="p-4">
                  <div>{order.customer_name}</div>
                  <div className="text-slate-500 text-xs">{order.customer_email}</div>
                </td>
                <td className="p-4 font-mono font-bold">{formatPrice(order.total)}</td>
                <td className="p-4">
                  <select 
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono p-2 rounded focus:ring-1 focus:ring-primary outline-none"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                  >
                    <option value="pending">PENDING</option>
                    <option value="paid">PAID</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="delivered">DELIVERED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-mono">NO_LOGISTICS_DATA</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
