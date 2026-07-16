'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { ContactInquiry } from '@/types'

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  
  useEffect(() => {
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => setInquiries(Array.isArray(data) ? data : []))
  }, [])

  const updateStatus = async (id: string, status: ContactInquiry['status']) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error()
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i))
      toast.success('Comm status updated.')
    } catch {
      toast.error('Update failed.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">SECURE_COMMS (INQUIRIES)</h1>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400">
            <tr>
              <th className="p-4 font-normal">TRANSMITTER</th>
              <th className="p-4 font-normal">SERVICE VECTOR</th>
              <th className="p-4 font-normal">PAYLOAD</th>
              <th className="p-4 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {inquiries.map(inquiry => (
              <tr key={inquiry.id} className="hover:bg-slate-800/30 group">
                <td className="p-4 w-48 align-top">
                  <div className="font-bold">{inquiry.name}</div>
                  <div className="text-slate-500 text-xs">{inquiry.email}</div>
                  {inquiry.company && <div className="text-slate-500 text-xs mt-1 border border-slate-800 bg-slate-900 px-1 inline-block">{inquiry.company}</div>}
                </td>
                <td className="p-4 w-40 align-top">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300">
                    {inquiry.service_category || 'GENERAL'}
                  </span>
                </td>
                <td className="p-4 align-top">
                  <p className="text-slate-300 whitespace-pre-wrap">{inquiry.message}</p>
                </td>
                <td className="p-4 w-32 align-top">
                  <select 
                    className={`bg-slate-900 border border-slate-800 text-xs font-mono p-2 rounded focus:ring-1 focus:ring-primary outline-none ${inquiry.status === 'new' ? 'text-primary border-primary/30 bg-primary/5' : 'text-slate-200'}`}
                    value={inquiry.status}
                    onChange={(e) => updateStatus(inquiry.id, e.target.value as ContactInquiry['status'])}
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="converted">CONVERTED</option>
                    <option value="closed">CLOSED</option>
                  </select>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-mono">NO_COMMUNICATIONS_RECEIVED</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
