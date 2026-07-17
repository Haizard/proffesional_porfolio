import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get('entity_type')
  const entityId = searchParams.get('entity_id')
  const sort = searchParams.get('sort') ?? 'newest' // 'newest' | 'top'

  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entity_type and entity_id required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch top-level comments with author profile
  let query = supabase
    .from('comments')
    .select(`
      *,
      author:profiles!user_id(full_name, avatar_url)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .is('parent_id', null)

  if (sort === 'top') {
    query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data: comments, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch replies for all top-level comments
  const commentIds = (comments ?? []).map((c: any) => c.id)
  let replies: any[] = []
  if (commentIds.length > 0) {
    const { data: replyData } = await supabase
      .from('comments')
      .select(`*, author:profiles!user_id(full_name, avatar_url)`)
      .in('parent_id', commentIds)
      .order('created_at', { ascending: true })
    replies = replyData ?? []
  }

  // Fetch user votes if logged in
  let userVotes: Record<string, string> = {}
  if (user) {
    const allIds = [...commentIds, ...replies.map((r: any) => r.id)]
    if (allIds.length > 0) {
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id, vote_type')
        .eq('user_id', user.id)
        .in('comment_id', allIds)
      ;(votes ?? []).forEach((v: any) => { userVotes[v.comment_id] = v.vote_type })
    }
  }

  // Attach replies and votes to comments
  const result = (comments ?? []).map((c: any) => ({
    ...c,
    user_vote: userVotes[c.id] ?? null,
    replies: replies
      .filter((r: any) => r.parent_id === c.id)
      .map((r: any) => ({ ...r, user_vote: userVotes[r.id] ?? null })),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required to comment' }, { status: 401 })

  const body = await request.json()
  const { entity_type, entity_id, content, parent_id } = body

  if (!entity_type || !entity_id || !content?.trim()) {
    return NextResponse.json({ error: 'entity_type, entity_id, and content are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      entity_type,
      entity_id,
      content: content.trim(),
      parent_id: parent_id ?? null,
    })
    .select(`*, author:profiles!user_id(full_name, avatar_url)`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, replies: [], user_vote: null }, { status: 201 })
}
