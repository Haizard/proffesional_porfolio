'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Globe, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import type { BlogPost } from '@/types'

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  
  useEffect(() => {
    // Fetch all posts regardless of status for admin
    fetch('/api/blog') // Assume admin route returns all
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
  }, [])

  const deletePost = async (id: string) => {
    if (!confirm('PURGE_INTEL_FILE?')) return
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPosts(posts.filter(p => p.id !== id))
      toast.success('File purged.')
    } catch {
      toast.error('Deletion failed.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">INTEL_DATABASE (CMS)</h1>
        <Button className="font-mono bg-primary text-black hover:bg-primary/80"><Plus className="mr-2 h-4 w-4" /> WRITE_INTEL</Button>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400">
            <tr>
              <th className="p-4 font-normal">TITLE</th>
              <th className="p-4 font-normal">CATEGORY</th>
              <th className="p-4 font-normal">STATUS</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-slate-800/30">
                <td className="p-4">
                  <div className="font-bold">{post.title}</div>
                  <div className="text-slate-500 font-mono text-xs">{new Date(post.created_at).toLocaleDateString()}</div>
                </td>
                <td className="p-4"><span className="text-xs font-mono">{post.category || 'N/A'}</span></td>
                <td className="p-4">
                  <div className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${post.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                    {post.status === 'published' ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {post.status.toUpperCase()}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-2" onClick={() => deletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-mono">NO_INTEL_FILES</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
