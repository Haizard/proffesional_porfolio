import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  if (!supabase) redirect('/')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin')

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-50 selection:bg-primary/30 selection:text-primary">
      <AdminSidebar />
      <main className="flex-1 pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
