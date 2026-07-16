'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import type { Service } from '@/types'

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []))
  }, [])

  const deleteService = async (id: string) => {
    if (!confirm('DELETE_RECORD?')) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setServices(services.filter(s => s.id !== id))
      toast.success('Record purged.')
    } catch {
      toast.error('Deletion failed.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">SERVICE_REGISTRY</h1>
        <Button className="font-mono bg-primary text-black hover:bg-primary/80"><Plus className="mr-2 h-4 w-4" /> ADD_SERVICE</Button>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400">
            <tr>
              <th className="p-4 font-normal">NAME/SLUG</th>
              <th className="p-4 font-normal">CATEGORY</th>
              <th className="p-4 font-normal">PRICE</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {services.map(service => (
              <tr key={service.id} className="hover:bg-slate-800/30">
                <td className="p-4">
                  <div className="font-bold">{service.name}</div>
                  <div className="text-slate-500 font-mono text-xs">{service.slug}</div>
                </td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">{service.category}</span></td>
                <td className="p-4 font-mono">{service.price_from ? `$${service.price_from}` : 'Custom'}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-2" onClick={() => deleteService(service.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-mono">NO_RECORDS</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
