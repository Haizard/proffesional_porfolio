import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const supabase = await createClient()
  let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(limit)

  if (featured === 'true') query = query.eq('is_featured', true)
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase.from('products').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
