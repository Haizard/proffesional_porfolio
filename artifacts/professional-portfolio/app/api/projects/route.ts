import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')
  const category = searchParams.get('category')
  const isFree = searchParams.get('is_free')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const statusParam = searchParams.get('status')
  const supabase = await createClient()
  let query = supabase
    .from('projects')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Admin requests pass status=all; public gets only published
  if (statusParam !== 'all') query = query.eq('status', 'published')

  if (featured === 'true') query = query.eq('is_featured', true)
  if (category) query = query.eq('category_id', category)
  if (isFree !== null && isFree !== undefined) query = query.eq('is_free', isFree === 'true')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase.from('projects').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
