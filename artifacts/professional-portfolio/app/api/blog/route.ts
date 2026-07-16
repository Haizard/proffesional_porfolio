import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'published'
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const supabase = await createClient()
  let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).limit(limit)

  if (status !== 'all') query = query.eq('status', status)
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
  const { data, error } = await supabase.from('blog_posts').insert({ ...body, author_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
