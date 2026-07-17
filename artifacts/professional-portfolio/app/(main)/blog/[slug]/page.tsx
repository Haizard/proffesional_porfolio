import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getPostBySlug } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { CommentSection } from '@/components/comments/CommentSection'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-12 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_INTEL
        </Link>

        <article>
          <header className="mb-12 border-b border-border pb-12">
            <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground mb-6">
              {post.category && <Badge variant="outline" className="text-primary border-primary/30">{post.category}</Badge>}
              <span className="flex items-center"><Calendar className="h-3 w-3 mr-2" /> {formatDate(post.published_at || post.created_at)}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground">
                {post.excerpt}
              </p>
            )}
          </header>

          {post.featured_image && (
            <div className="mb-12 aspect-video w-full rounded-sm border border-border overflow-hidden bg-muted">
              <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:font-mono max-w-none">
            {post.content ? (
              <ReactMarkdown>{post.content}</ReactMarkdown>
            ) : (
              <p>CONTENT_ENCRYPTED_OR_MISSING</p>
            )}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border flex items-center gap-4">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </article>

        <CommentSection entityType="blog" entityId={post.id} />
      </div>
    </div>
  )
}
