import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: commentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required to vote' }, { status: 401 })

  const { vote_type } = await request.json() // 'like' | 'dislike'
  if (!['like', 'dislike'].includes(vote_type)) {
    return NextResponse.json({ error: 'vote_type must be like or dislike' }, { status: 400 })
  }

  // Check existing vote
  const { data: existing } = await supabase
    .from('comment_votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single()

  if (existing) {
    if (existing.vote_type === vote_type) {
      // Toggle off — remove vote
      await supabase.from('comment_votes').delete().eq('id', existing.id)
      // Decrement count
      const col = vote_type === 'like' ? 'likes_count' : 'dislikes_count'
      await supabase.rpc('decrement_comment_vote', { comment_id: commentId, col_name: col })
      return NextResponse.json({ vote_type: null })
    } else {
      // Switch vote
      await supabase.from('comment_votes').update({ vote_type }).eq('id', existing.id)
      // Adjust counts
      const addCol = vote_type === 'like' ? 'likes_count' : 'dislikes_count'
      const subCol = vote_type === 'like' ? 'dislikes_count' : 'likes_count'
      await supabase.rpc('switch_comment_vote', { comment_id: commentId, add_col: addCol, sub_col: subCol })
      return NextResponse.json({ vote_type })
    }
  } else {
    // New vote
    await supabase.from('comment_votes').insert({ user_id: user.id, comment_id: commentId, vote_type })
    const col = vote_type === 'like' ? 'likes_count' : 'dislikes_count'
    await supabase.rpc('increment_comment_vote', { comment_id: commentId, col_name: col })
    return NextResponse.json({ vote_type })
  }
}
