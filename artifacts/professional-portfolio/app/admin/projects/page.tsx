'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Globe, EyeOff, X, Save, Loader2, Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import type { Project, Category } from '@/types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const EMPTY: Partial<Project> = {
  title: '', slug: '', description: '', long_description: '', featured_image: '',
  images: [], tags: [], tech_stack: [], is_free: true, price: null,
  preview_url: '', download_url: '', status: 'draft', is_featured: false,
}

function arrayField(v: string[] | string | undefined): string {
  if (!v) return ''
  if (Array.isArray(v)) return v.join(', ')
  return v
}

function ProjectForm({ project, categories, onSave, onClose }: {
  project: Partial<Project>; categories: Category[]; onSave: (p: Project) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Project>>(project)
  const [saving, setSaving] = useState(false)
  const isEdit = !!project.id
  const set = (k: keyof Project, v: any) => setForm(f => ({ ...f, [k]: v }))

  const splitArr = (s: string | string[] | undefined): string[] =>
    (Array.isArray(s) ? s : (typeof s === 'string' ? s : '')).toString().split(',').map(t => t.trim()).filter(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim() || !form.description?.trim()) { toast.error('Title and description required'); return }
    setSaving(true)
    try {
      const slug = form.slug?.trim() || slugify(form.title!)
      const payload = {
        ...form, slug,
        tags: splitArr(form.tags as any),
        tech_stack: splitArr(form.tech_stack as any),
        images: splitArr(form.images as any),
        price: form.is_free ? null : (typeof form.price === 'string' ? parseFloat(form.price as any) : form.price),
        download_url: form.download_url || null,
        preview_url: form.preview_url || null,
        category_id: form.category_id || null,
      }
      const url = isEdit ? `/api/projects/${project.id}` : '/api/projects'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Save failed'); return }
      const saved = await res.json()
      toast.success(isEdit ? 'Project updated.' : 'Project created.')
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-[#0a0f1c] border border-slate-700 rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-mono font-bold text-lg">{isEdit ? 'EDIT_PROJECT' : 'NEW_PROJECT'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">TITLE *</label>
              <Input value={form.title ?? ''} onChange={e => { set('title', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)) }} required placeholder="Project title" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">SLUG</label>
              <Input value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className="font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">CATEGORY</label>
              <select value={form.category_id ?? ''} onChange={e => set('category_id', e.target.value || null)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="">— None —</option>
                {categories.filter(c => c.type === 'project' || c.type === 'general').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">SHORT DESCRIPTION *</label>
              <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} required
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">LONG DESCRIPTION</label>
              <textarea value={form.long_description ?? ''} onChange={e => set('long_description', e.target.value)} rows={6}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y" placeholder="Detailed description..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">FEATURED IMAGE URL</label>
              <Input value={form.featured_image ?? ''} onChange={e => set('featured_image', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">TECH STACK (comma-separated)</label>
              <Input value={arrayField(form.tech_stack)} onChange={e => set('tech_stack', e.target.value as any)} placeholder="React, Next.js, Supabase" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">TAGS (comma-separated)</label>
              <Input value={arrayField(form.tags)} onChange={e => set('tags', e.target.value as any)} placeholder="automation, AI, web" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">PREVIEW URL</label>
              <Input value={form.preview_url ?? ''} onChange={e => set('preview_url', e.target.value)} placeholder="https://demo.example.com" />
            </div>

            {/* Free / Paid toggle */}
            <div className="md:col-span-2 flex items-center gap-4 p-4 bg-slate-800/40 rounded-sm border border-slate-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_free ?? true} onChange={e => set('is_free', e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span className="font-mono text-sm">FREE PROJECT</span>
              </label>
              {form.is_free ? (
                <div className="flex-1">
                  <label className="block text-xs font-mono text-slate-400 mb-1">DOWNLOAD URL</label>
                  <Input value={form.download_url ?? ''} onChange={e => set('download_url', e.target.value)} placeholder="https://github.com/..." />
                </div>
              ) : (
                <div className="flex-1">
                  <label className="block text-xs font-mono text-slate-400 mb-1">PRICE (USD)</label>
                  <Input type="number" min="0" step="0.01" value={form.price ?? ''} onChange={e => set('price', e.target.value)} placeholder="29.99" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">STATUS</label>
              <select value={form.status ?? 'draft'} onChange={e => set('status', e.target.value as any)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono">
                <option value="draft">DRAFT</option>
                <option value="published">PUBLISHED</option>
              </select>
            </div>
            <div className="flex items-center gap-3 self-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured ?? false} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="font-mono text-sm text-slate-300">FEATURED</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Partial<Project> | null>(null)

  useEffect(() => {
    fetch('/api/projects?status=all&limit=100').then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : []))
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []))
  }, [])

  const handleSave = (saved: Project) => {
    setProjects(prev => prev.some(p => p.id === saved.id) ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev])
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('DELETE_PROJECT?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Deletion failed'); return }
    setProjects(prev => prev.filter(p => p.id !== id))
    toast.success('Project deleted.')
  }

  const toggleStatus = async (project: Project) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) { toast.error('Update failed'); return }
    const updated = await res.json()
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p))
    toast.success(`Project ${newStatus}.`)
  }

  return (
    <div className="space-y-8">
      {editing && <ProjectForm project={editing} categories={categories} onSave={handleSave} onClose={() => setEditing(null)} />}

      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold font-mono">PROJECT_ARCHIVE <span className="text-slate-500 text-lg">({projects.length})</span></h1>
        <Button onClick={() => setEditing(EMPTY)} className="font-mono bg-primary text-black hover:bg-primary/80">
          <Plus className="mr-2 h-4 w-4" /> ADD_PROJECT
        </Button>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 text-xs">
            <tr>
              <th className="p-4 font-normal">TITLE / SLUG</th>
              <th className="p-4 font-normal hidden md:table-cell">TYPE</th>
              <th className="p-4 font-normal hidden lg:table-cell">TECH STACK</th>
              <th className="p-4 font-normal">STATUS</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {projects.map(project => (
              <tr key={project.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-100 flex items-center gap-2">
                    {project.title}
                    {project.is_featured && <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">FEATURED</span>}
                  </div>
                  <div className="text-slate-500 font-mono text-xs mt-0.5">/{project.slug}</div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  {project.is_free ? (
                    <span className="flex items-center gap-1 text-xs font-mono text-green-400"><Download className="h-3 w-3" /> FREE</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-mono text-yellow-400"><Lock className="h-3 w-3" /> ${project.price}</span>
                  )}
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(project.tech_stack ?? []).slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(project)}
                    className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border transition-colors ${project.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'}`}>
                    {project.status === 'published' ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {project.status.toUpperCase()}
                  </button>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(project)} className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-1"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-mono text-sm">NO_PROJECTS_FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
