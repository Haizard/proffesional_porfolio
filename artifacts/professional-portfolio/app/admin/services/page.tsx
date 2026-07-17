'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X, Save, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import type { Service } from '@/types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const CATEGORIES = [
  'ai-automation', 'marketing', 'web-development', 'saas-development',
  'b2b-delivery', 'forex-bots', 'computer-building', 'ai-machines',
  'ai-configuration', 'server-setup',
]

const EMPTY: Partial<Service> = {
  name: '', slug: '', description: '', long_description: '',
  icon: '', category: '', features: [], price_from: null, is_featured: false,
}

function ServiceForm({ service, onSave, onClose }: {
  service: Partial<Service>; onSave: (s: Service) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Service>>(service)
  const [saving, setSaving] = useState(false)
  const isEdit = !!service.id
  const set = (k: keyof Service, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Name is required'); return }
    if (!form.description?.trim()) { toast.error('Description is required'); return }
    setSaving(true)
    try {
      const slug = form.slug?.trim() || slugify(form.name!)
      const features = typeof form.features === 'string'
        ? (form.features as any).split(',').map((f: string) => f.trim()).filter(Boolean)
        : (form.features ?? [])
      const payload = {
        ...form, slug, features,
        price_from: form.price_from ? Number(form.price_from) : null,
      }
      const url = isEdit ? `/api/services/${service.id}` : '/api/services'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Save failed'); return }
      const saved = await res.json()
      toast.success(isEdit ? 'Service updated.' : 'Service created.')
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-[#0a0f1c] border border-slate-700 rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-mono font-bold text-lg">{isEdit ? 'EDIT_SERVICE' : 'NEW_SERVICE'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">NAME *</label>
              <Input
                value={form.name ?? ''}
                onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)) }}
                placeholder="Service name" required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">SLUG</label>
              <Input value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className="font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">ICON (emoji or text)</label>
              <Input value={form.icon ?? ''} onChange={e => set('icon', e.target.value)} placeholder="🤖" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">CATEGORY *</label>
              <select
                value={form.category ?? ''}
                onChange={e => set('category', e.target.value)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono"
                required
              >
                <option value="">— Select Category —</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">PRICE FROM (USD, blank = custom)</label>
              <Input
                type="number" min="0" step="0.01"
                value={form.price_from ?? ''}
                onChange={e => set('price_from', e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">SHORT DESCRIPTION *</label>
              <textarea
                value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} required
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="One-liner summary of the service"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">LONG DESCRIPTION</label>
              <textarea
                value={form.long_description ?? ''} onChange={e => set('long_description', e.target.value)} rows={5}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"
                placeholder="Detailed description (Markdown supported)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">FEATURES (comma-separated)</label>
              <Input
                value={Array.isArray(form.features) ? form.features.join(', ') : (form.features ?? '')}
                onChange={e => set('features', e.target.value as any)}
                placeholder="AI integration, 24/7 support, Custom dashboard"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured ?? false} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="font-mono text-sm text-slate-300 flex items-center gap-1"><Star className="h-3 w-3 text-primary" /> FEATURED</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="font-mono">CANCEL</Button>
            <Button type="submit" disabled={saving} className="font-mono bg-primary text-black hover:bg-primary/90">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</> : <><Save className="mr-2 h-4 w-4" /> {isEdit ? 'UPDATE' : 'CREATE'}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<Partial<Service> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = (saved: Service) => {
    setServices(prev => prev.some(s => s.id === saved.id) ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev])
    setEditing(null)
  }

  const deleteService = async (id: string) => {
    if (!confirm('DELETE_SERVICE?')) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setServices(prev => prev.filter(s => s.id !== id))
      toast.success('Service deleted.')
    } catch {
      toast.error('Deletion failed.')
    }
  }

  return (
    <div className="space-y-8">
      {editing && <ServiceForm service={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">SERVICE_REGISTRY <span className="text-slate-500 text-lg">({services.length})</span></h1>
        <Button onClick={() => setEditing(EMPTY)} className="font-mono bg-primary text-black hover:bg-primary/80">
          <Plus className="mr-2 h-4 w-4" /> ADD_SERVICE
        </Button>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 text-xs">
            <tr>
              <th className="p-4 font-normal">NAME / SLUG</th>
              <th className="p-4 font-normal hidden md:table-cell">CATEGORY</th>
              <th className="p-4 font-normal hidden lg:table-cell">FEATURES</th>
              <th className="p-4 font-normal">PRICE</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-sm">LOADING_REGISTRY...</td></tr>
            )}
            {!loading && services.map(service => (
              <tr key={service.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-semibold flex items-center gap-2">
                    {service.icon && <span>{service.icon}</span>}
                    {service.name}
                    {service.is_featured && <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">FEATURED</span>}
                  </div>
                  <div className="text-slate-500 font-mono text-xs mt-0.5">/{service.slug}</div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">{service.category}</span>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <span className="text-xs text-slate-400">{(service.features ?? []).length} features</span>
                </td>
                <td className="p-4 font-mono text-sm">
                  {service.price_from ? `$${service.price_from}+` : 'Custom'}
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(service)} className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-1"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {!loading && services.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-mono">NO_RECORDS_FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
