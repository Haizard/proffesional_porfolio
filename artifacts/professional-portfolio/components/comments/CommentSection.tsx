'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Pin, MoreVertical, Pencil, Trash2, Flag, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Comment, CommentEntityType } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'

interface CommentSectionProps {
  entityType: CommentEntityType
  entityId: string
}

function Avatar({ name, size = 'md' }: { name?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const letter = name?.charAt(0).toUpperCase() ?? '?'
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-10 h-10 text-base' }
  return (
    <div className={`${sizes[size]} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary flex-shrink-0`}>
      {letter}
    </div>
  )
}

function VoteButton({ icon: Icon, count, active, onClick }: { icon: any; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded transition-colors ${
        active ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? 'fill-primary' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}

interface CommentItemProps {
  comment: Comment
  onDelete: (id: string) => void
  onUpdate: (id: string, content: string) => void
  onVote: (id: string, type: 'like' | 'dislike') => void
  onPin: (id: string, pinned: boolean) => void
  onReply: (comment: Comment) => void
  currentUserId?: string
  isAdmin?: boolean
  depth?: number
}

function CommentItem({ comment, onDelete, onUpdate, onVote, onPin, onReply, currentUserId, isAdmin, depth = 0 }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const isOwn = currentUserId === comment.user_id
  const authorName = comment.author?.full_name ?? 'Anonymous'
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

  const handleSaveEdit = () => {
    if (editText.trim() === comment.content) { setEditing(false); return }
    onUpdate(comment.id, editText.trim())
    setEditing(false)
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-10 mt-3' : ''}`}>
      <Avatar name={authorName} size={depth > 0 ? 'sm' : 'md'} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-slate-100">{authorName}</span>
          {comment.is_pinned && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
              <Pin className="h-2.5 w-2.5" /> PINNED
            </span>
          )}
          <span className="text-xs text-slate-500">{timeAgo}</span>
          {comment.is_edited && <span className="text-xs text-slate-600 italic">(edited)</span>}
        </div>

        {/* Content */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded text-sm text-slate-100 p-2 resize-none focus:outline-none focus:border-primary/50 min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="text-xs font-mono bg-primary text-black px-3 py-1 rounded hover:bg-primary/90 transition-colors">SAVE</button>
              <button onClick={() => { setEditing(false); setEditText(comment.content) }} className="text-xs font-mono text-slate-400 hover:text-slate-200 px-3 py-1">CANCEL</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-1 mt-2">
            <VoteButton icon={ThumbsUp} count={comment.likes_count} active={comment.user_vote === 'like'} onClick={() => onVote(comment.id, 'like')} />
            <VoteButton icon={ThumbsDown} count={comment.dislikes_count} active={comment.user_vote === 'dislike'} onClick={() => onVote(comment.id, 'dislike')} />

            {depth === 0 && currentUserId && (
              <button
                onClick={() => onReply(comment)}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors ml-1"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Reply
              </button>
            )}

            {/* Overflow menu */}
            <div className="relative ml-auto">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition-colors">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#0a0f1c] border border-slate-700 rounded shadow-xl z-10">
                  {isOwn && (
                    <button onClick={() => { setEditing(true); setShowMenu(false) }} className="flex items-center gap-2 w-full text-left text-xs font-mono text-slate-300 hover:text-primary hover:bg-primary/5 px-3 py-2 transition-colors">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => { onPin(comment.id, !comment.is_pinned); setShowMenu(false) }} className="flex items-center gap-2 w-full text-left text-xs font-mono text-slate-300 hover:text-primary hover:bg-primary/5 px-3 py-2 transition-colors">
                      <Pin className="h-3 w-3" /> {comment.is_pinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {(isOwn || isAdmin) && (
                    <button onClick={() => { onDelete(comment.id); setShowMenu(false) }} className="flex items-center gap-2 w-full text-left text-xs font-mono text-red-400 hover:bg-red-500/10 px-3 py-2 transition-colors">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  )}
                  <button onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full text-left text-xs font-mono text-slate-400 hover:text-slate-200 px-3 py-2 transition-colors">
                    <Flag className="h-3 w-3" /> Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Replies toggle */}
        {depth === 0 && comment.replies && comment.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 mt-2 transition-colors"
          >
            {showReplies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showReplies ? 'Hide' : `View`} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {/* Replies list */}
        {showReplies && comment.replies && (
          <div className="mt-3 space-y-4 border-l border-slate-800 pl-4">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onVote={onVote}
                onPin={onPin}
                onReply={onReply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                depth={1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { user, profile, isAdmin } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'top'>('newest')
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}&sort=${sort}`)
      if (res.ok) setComments(await res.json())
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, sort])

  useEffect(() => { fetchComments() }, [fetchComments])

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = newComment.trim()
    if (!text || !user) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, content: text }),
      })
      if (!res.ok) { toast.error('Failed to post comment'); return }
      const created = await res.json()
      setComments(prev => [created, ...prev])
      setNewComment('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = replyText.trim()
    if (!text || !user || !replyingTo) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, content: text, parent_id: replyingTo.id }),
      })
      if (!res.ok) { toast.error('Failed to post reply'); return }
      const created = await res.json()
      setComments(prev => prev.map(c =>
        c.id === replyingTo.id
          ? { ...c, replies: [...(c.replies ?? []), created] }
          : c
      ))
      setReplyText('')
      setReplyingTo(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    if (!user) { toast.error('Login to vote'); return }
    const res = await fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote_type: voteType }),
    })
    if (!res.ok) return
    const { vote_type: newVote } = await res.json()

    const updateComment = (c: Comment): Comment => {
      if (c.id !== commentId) return c
      const prevVote = c.user_vote
      let likes = c.likes_count
      let dislikes = c.dislikes_count
      if (prevVote === 'like') likes--
      if (prevVote === 'dislike') dislikes--
      if (newVote === 'like') likes++
      if (newVote === 'dislike') dislikes++
      return { ...c, likes_count: likes, dislikes_count: dislikes, user_vote: newVote }
    }

    setComments(prev => prev.map(c => ({
      ...updateComment(c),
      replies: (c.replies ?? []).map(updateComment),
    })))
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete'); return }
    setComments(prev => prev
      .filter(c => c.id !== commentId)
      .map(c => ({ ...c, replies: (c.replies ?? []).filter(r => r.id !== commentId) }))
    )
    toast.success('Comment deleted')
  }

  const handleUpdate = async (commentId: string, content: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok) { toast.error('Failed to update'); return }
    const updated = await res.json()
    setComments(prev => prev
      .map(c => c.id === commentId ? { ...c, ...updated, replies: c.replies } : c)
      .map(c => ({ ...c, replies: (c.replies ?? []).map(r => r.id === commentId ? { ...r, ...updated } : r) }))
    )
  }

  const handlePin = async (commentId: string, pinned: boolean) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: pinned }),
    })
    if (!res.ok) { toast.error('Failed to pin/unpin'); return }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_pinned: pinned } : c))
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold font-mono flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {totalCount > 0 ? `${totalCount} Comment${totalCount !== 1 ? 's' : ''}` : 'Comments'}
        </h2>
        <div className="flex items-center gap-1 border border-slate-800 rounded p-1">
          {(['newest', 'top'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`text-xs font-mono px-3 py-1 rounded transition-colors ${sort === s ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-200'}`}>
              {s === 'newest' ? 'NEWEST' : 'TOP'}
            </button>
          ))}
        </div>
      </div>

      {/* New comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <Avatar name={profile?.full_name} />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={1}
              onFocus={e => { e.target.rows = 3 }}
              onBlur={e => { if (!newComment) e.target.rows = 1 }}
              className="w-full bg-transparent border-b border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary py-2 resize-none transition-colors"
            />
            {newComment && (
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setNewComment('')} className="text-xs font-mono text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded transition-colors">CANCEL</button>
                <button type="submit" disabled={submitting || !newComment.trim()} className="flex items-center gap-1.5 text-xs font-mono bg-primary text-black px-4 py-1.5 rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Send className="h-3 w-3" /> COMMENT
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 border border-dashed border-slate-700 rounded text-center">
          <p className="text-sm text-slate-400 font-mono">
            <a href="/auth/login" className="text-primary hover:text-primary/80">LOGIN</a> to join the conversation
          </p>
        </div>
      )}

      {/* Reply box */}
      {replyingTo && (
        <div className="ml-12 mb-6 flex gap-3 p-3 bg-slate-800/30 rounded border border-slate-700/50">
          <Avatar name={profile?.full_name} size="sm" />
          <div className="flex-1">
            <p className="text-xs font-mono text-slate-500 mb-2">Replying to <span className="text-primary">{replyingTo.author?.full_name ?? 'Anonymous'}</span></p>
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${replyingTo.author?.full_name ?? 'Anonymous'}...`}
                rows={2}
                autoFocus
                className="w-full bg-transparent border-b border-slate-600 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary pb-1 resize-none transition-colors"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setReplyingTo(null); setReplyText('') }} className="text-xs font-mono text-slate-400 hover:text-slate-200 px-3 py-1 rounded">CANCEL</button>
                <button type="submit" disabled={submitting || !replyText.trim()} className="flex items-center gap-1.5 text-xs font-mono bg-primary text-black px-3 py-1 rounded hover:bg-primary/90 disabled:opacity-50">
                  <Send className="h-3 w-3" /> REPLY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-24" />
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded">
          <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-mono text-sm">NO_COMMENTS_YET</p>
          <p className="text-slate-600 text-xs mt-1">Be the first to comment</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned first */}
          {comments.filter(c => c.is_pinned).map(c => (
            <CommentItem key={c.id} comment={c} onDelete={handleDelete} onUpdate={handleUpdate}
              onVote={handleVote} onPin={handlePin} onReply={setReplyingTo}
              currentUserId={user?.id} isAdmin={isAdmin} />
          ))}
          {comments.filter(c => !c.is_pinned).map(c => (
            <CommentItem key={c.id} comment={c} onDelete={handleDelete} onUpdate={handleUpdate}
              onVote={handleVote} onPin={handlePin} onReply={setReplyingTo}
              currentUserId={user?.id} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </section>
  )
}
