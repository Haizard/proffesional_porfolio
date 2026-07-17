'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Globe, EyeOff, X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import type { BlogPost } from '@/types'

const EMPTY: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', category: '',
  tags: [], status: 'draft', featured_image: '', related_service_slugs: [], related_product_slugs: [],
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function PostForm({ post, onSave, onClose }: { post: Partial<BlogPost>; onSave: (p: BlogPost) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<BlogPost>>(post)
  const [saving, setSaving] = useState(false)
  const isEdit = !!post.id

  const set = (k: keyof BlogPost, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    try {
      const slug = form.slug?.trim() || slugify(form.title!)
      const payload = { ...form, slug, tags: typeof form.tags === 'string' ? (form.tags as any).split(',').map((t: string) => t.trim()).filter(Boolean) : form.tags ?? [] }
      const url = isEdit ? `/api/blog/${post.id}` : '/api/blog'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Save failed'); return }
      const saved = await res.json()
      toast.success(isEdit ? 'Post updated.' : 'Post created.')
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-[#0a0f1c] border border-slate-700 rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-mono font-bold text-lg">{isEdit ? 'EDIT_INTEL_FILE' : 'WRITE_INTEL_FILE'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">TITLE *</label>
              <Input value={form.title ?? ''} onChange={e => { set('title', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)) }} placeholder="Post title" required />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">SLUG</label>
              <Input value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className="font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">CATEGORY</label>
              <Input value={form.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="e.g. AI, Automation" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">EXCERPT</label>
              <textarea value={form.excerpt ?? ''} onChange={e => set('excerpt', e.target.value)} rows={2}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Short summary..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">CONTENT (Markdown)</label>
              <textarea value={form.content ?? ''} onChange={e => set('content', e.target.value)} rows={14}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary resize-y" placeholder="Write your post in Markdown..." />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">FEATURED IMAGE URL</label>
              <Input value={form.featured_image ?? ''} onChange={e => set('featured_image', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">TAGS (comma-separated)</label>
              <Input value={Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags ?? '')} onChange={e => set('tags', e.target.value as any)} placeholder="AI, automation, bots" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">STATUS</label>
              <select value={form.status ?? 'draft'} onChange={e => set('status', e.target.value as any)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono">
                <option value="draft">DRAFT</option>
                <option value="published">PUBLISHED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="font-mono">CANCEL</Button>
            <Button type="submit" disabled={saving} className="font-mono bg-primary text-black hover:bg-primary/90">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</> : <><Save className="mr-2 h-4 w-4" /> {isEdit ? 'UPDATE' : 'PUBLISH'}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/blog?status=all&limit=100')
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
  }, [])

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (saved: BlogPost) => {
    setPosts(prev => prev.some(p => p.id === saved.id) ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev])
    setEditing(null)
  }

  const deletePost = async (id: string) => {
    if (!confirm('PURGE_INTEL_FILE?')) return
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Deletion failed.'); return }
    setPosts(prev => prev.filter(p => p.id !== id))
    toast.success('File purged.')
  }

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/blog/${post.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, ...(newStatus === 'published' && !post.published_at ? { published_at: new Date().toISOString() } : {}) }),
    })
    if (!res.ok) { toast.error('Update failed.'); return }
    const updated = await res.json()
    setPosts(prev => prev.map(p => p.id === post.id ? updated : p))
    toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}.`)
  }

  return (
    <div className="space-y-8">
      {editing && <PostForm post={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold font-mono">INTEL_DATABASE <span className="text-slate-500 text-lg">({posts.length})</span></h1>
        <div className="flex gap-3">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-48 font-mono text-sm" />
          <Button onClick={() => setEditing(EMPTY)} className="font-mono bg-primary text-black hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" /> WRITE_INTEL
          </Button>
        </div>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 text-xs">
            <tr>
              <th className="p-4 font-normal">TITLE / SLUG</th>
              <th className="p-4 font-normal hidden md:table-cell">CATEGORY</th>
              <th className="p-4 font-normal">STATUS</th>
              <th className="p-4 font-normal hidden lg:table-cell">PUBLISHED</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(post => (
              <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-100 line-clamp-1">{post.title}</div>
                  <div className="text-slate-500 font-mono text-xs mt-0.5">/{post.slug}</div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded">{post.category || '—'}</span>
                </td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(post)}
                    className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border transition-colors ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'}`}>
                    {post.status === 'published' ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {post.status.toUpperCase()}
                  </button>
                </td>
                <td className="p-4 hidden lg:table-cell text-xs text-slate-500 font-mono">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(post)} className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-1"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-mono text-sm">NO_INTEL_FILES</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
