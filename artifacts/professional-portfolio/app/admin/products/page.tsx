'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
  }, [])

  const deleteProduct = async (id: string) => {
    if (!confirm('DESTROY_HARDWARE_PROFILE?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setProducts(products.filter(p => p.id !== id))
      toast.success('Hardware profile erased.')
    } catch {
      toast.error('Deletion failed.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">HARDWARE_INVENTORY</h1>
        <Button className="font-mono bg-primary text-black hover:bg-primary/80"><Plus className="mr-2 h-4 w-4" /> NEW_HARDWARE</Button>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400">
            <tr>
              <th className="p-4 font-normal">ITEM</th>
              <th className="p-4 font-normal">CLASS</th>
              <th className="p-4 font-normal">STOCK</th>
              <th className="p-4 font-normal">PRICE</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-800/30">
                <td className="p-4">
                  <div className="font-bold">{product.name}</div>
                  <div className="text-slate-500 font-mono text-xs">{product.slug}</div>
                </td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">{product.category}</span></td>
                <td className="p-4 font-mono">
                  <span className={product.stock > 0 ? 'text-green-400' : 'text-red-500'}>{product.stock} UNITS</span>
                </td>
                <td className="p-4 font-mono">{formatPrice(product.price)}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-2" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-mono">NO_INVENTORY_FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
