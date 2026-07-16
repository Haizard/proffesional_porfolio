import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, company, service_category, subject, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('contact_inquiries')
    .insert({ name, email, phone, company, service_category, subject, message })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
