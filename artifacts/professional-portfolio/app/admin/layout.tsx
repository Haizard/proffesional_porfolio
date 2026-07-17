'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Terminal, LayoutDashboard, Server, FileText, Cpu, Package, MessageSquare, LogOut, FolderTree, Code2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, loading, isAdmin, router])

  if (!mounted || loading || !isAdmin) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono text-xl">BOOTING_SYS_ADMIN...</div>

  const nav = [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/services', icon: Server, label: 'Services' },
    { href: '/admin/products', icon: Cpu, label: 'Hardware' },
    { href: '/admin/projects', icon: Code2, label: 'Projects' },
    { href: '/admin/orders', icon: Package, label: 'Orders' },
    { href: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
    { href: '/admin/blog', icon: FileText, label: 'Intel (Blog)' },
    { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
  ]

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-50 selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0a0f1c] flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/" className="font-mono font-bold flex items-center gap-2 text-primary">
            <Terminal className="h-5 w-5" /> SYS_ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-mono transition-colors ${
                  active ? 'bg-primary/10 text-primary border border-primary/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-sm text-sm font-mono text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> DISCONNECT
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 pl-64 flex flex-col min-h-screen relative">
        <header className="h-16 border-b border-slate-800 bg-[#0a0f1c]/80 backdrop-blur sticky top-0 z-10 flex items-center px-8">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            {pathname.replace('/admin', '').replace('/', '') || 'OVERVIEW'}
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: { background: '#0a0f1c', color: '#f8fafc', border: '1px solid #1e293b', borderRadius: '2px', fontFamily: 'var(--font-geist-mono)' },
          success: { iconTheme: { primary: '#00f0ff', secondary: '#000000' } }
        }} 
      />
    </div>
  )
}
