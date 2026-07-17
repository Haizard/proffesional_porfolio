'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, ChevronRight, FolderOpen, X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import type { Category } from '@/types'

const TYPES = ['general', 'blog', 'service', 'product', 'project'] as const

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function CategoryForm({ cat, categories, onSave, onClose }: {
  cat: Partial<Category>; categories: Category[]; onSave: (c: Category) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Category>>(cat)
  const [saving, setSaving] = useState(false)
  const isEdit = !!cat.id
  const set = (k: keyof Category, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      const slug = form.slug?.trim() || slugify(form.name!)
      const payload = { ...form, slug, parent_id: form.parent_id || null }
      const url = isEdit ? `/api/categories/${cat.id}` : '/api/categories'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Save failed'); return }
      const saved = await res.json()
      toast.success(isEdit ? 'Category updated.' : 'Category created.')
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  const parents = categories.filter(c => c.id !== cat.id)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0a0f1c] border border-slate-700 rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="font-mono font-bold">{isEdit ? 'EDIT_CATEGORY' : 'NEW_CATEGORY'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">NAME *</label>
            <Input value={form.name ?? ''} onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)) }} required placeholder="Category name" />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">SLUG</label>
            <Input value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className="font-mono" />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">TYPE</label>
            <select value={form.type ?? 'general'} onChange={e => set('type', e.target.value as any)}
              className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono">
              {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">PARENT CATEGORY</label>
            <select value={form.parent_id ?? ''} onChange={e => set('parent_id', e.target.value || null)}
              className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">— None (top level) —</option>
              {parents.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">DESCRIPTION</label>
            <Input value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">ICON (emoji/text)</label>
              <Input value={form.icon ?? ''} onChange={e => set('icon', e.target.value)} placeholder="🤖" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">COLOR (hex)</label>
              <Input value={form.color ?? ''} onChange={e => set('color', e.target.value)} placeholder="#00f0ff" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">SORT ORDER</label>
            <Input type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', parseInt(e.target.value))} />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="font-mono">CANCEL</Button>
            <Button type="submit" disabled={saving} className="font-mono bg-primary text-black hover:bg-primary/90">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</> : <><Save className="mr-2 h-4 w-4" /> SAVE</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function buildTree(cats: Category[]): Category[] {
  const map = new Map(cats.map(c => [c.id, { ...c, children: [] as Category[] }]))
  const roots: Category[] = []
  map.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children!.push(c)
    } else {
      roots.push(c)
    }
  })
  return roots
}

function CategoryRow({ cat, depth, onEdit, onDelete }: {
  cat: Category & { children?: Category[] }; depth: number; onEdit: (c: Category) => void; onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = (cat.children?.length ?? 0) > 0

  return (
    <>
      <tr className="hover:bg-slate-800/30 transition-colors">
        <td className="p-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-primary transition-colors">
                <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <span className="w-4 inline-block" />
            )}
            {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
            <FolderOpen className="h-4 w-4 text-primary/50" />
            <span className="font-semibold text-slate-100">{cat.name}</span>
            {cat.color && <span className="w-2.5 h-2.5 rounded-full border border-slate-600 flex-shrink-0" style={{ backgroundColor: cat.color }} />}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-0.5" style={{ paddingLeft: depth * 20 + 48 }}>/{cat.slug}</div>
        </td>
        <td className="p-4"><span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded">{cat.type.toUpperCase()}</span></td>
        <td className="p-4 text-xs text-slate-400">{cat.description || '—'}</td>
        <td className="p-4 text-xs font-mono text-slate-500 text-center">{(cat.children?.length ?? 0)}</td>
        <td className="p-4 text-right whitespace-nowrap">
          <Button variant="ghost" size="icon" onClick={() => onEdit(cat)} className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(cat.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-1"><Trash2 className="h-4 w-4" /></Button>
        </td>
      </tr>
      {expanded && cat.children?.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Partial<Category> | null>(null)
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []))
  }, [])

  const handleSave = (saved: Category) => {
    setCategories(prev => prev.some(c => c.id === saved.id) ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved])
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('DELETE_CATEGORY? Children will become top-level.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Deletion failed'); return }
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success('Category deleted.')
  }

  const filtered = filterType ? categories.filter(c => c.type === filterType) : categories
  const tree = buildTree(filtered)

  return (
    <div className="space-y-8">
      {editing && <CategoryForm cat={editing} categories={categories} onSave={handleSave} onClose={() => setEditing(null)} />}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold font-mono">CATEGORY_TREE <span className="text-slate-500 text-lg">({categories.length})</span></h1>
        <div className="flex gap-3">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-[#0a0f1c] border border-slate-700 rounded-sm px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-primary">
            <option value="">ALL TYPES</option>
            {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <Button onClick={() => setEditing({ type: 'general', sort_order: 0 })} className="font-mono bg-primary text-black hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" /> ADD_CATEGORY
          </Button>
        </div>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 text-xs">
            <tr>
              <th className="p-4 font-normal">NAME / SLUG</th>
              <th className="p-4 font-normal">TYPE</th>
              <th className="p-4 font-normal">DESCRIPTION</th>
              <th className="p-4 font-normal text-center">CHILDREN</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tree.map(cat => (
              <CategoryRow key={cat.id} cat={cat} depth={0} onEdit={setEditing} onDelete={handleDelete} />
            ))}
            {tree.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-mono text-sm">NO_CATEGORIES_FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
