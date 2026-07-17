import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Try by slug first, then by id
  let { data, error } = await supabase
    .from('projects')
    .select('*, category:categories(*)')
    .eq('slug', id)
    .single()

  if (error || !data) {
    const result = await supabase
      .from('projects')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()
    data = result.data
    error = result.error
  }

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check if user has purchased (for paid projects)
  const session = await supabase.auth.getUser()
  const userId = session.data.user?.id

  let hasPurchased = false
  if (userId && !data.is_free) {
    const { data: purchase } = await supabase
      .from('project_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', data.id)
      .eq('status', 'paid')
      .single()
    hasPurchased = !!purchase
  }

  return NextResponse.json({ ...data, has_purchased: hasPurchased })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('projects')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
