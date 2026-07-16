import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { getPosts } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Intel & Intelligence',
  description: 'Latest insights on AI, automation, and tech infrastructure.',
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="max-w-3xl mb-16">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="font-mono uppercase tracking-wider">Intel_Log</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Intelligence <span className="text-primary font-mono text-glow">Feed</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Technical breakdowns, infrastructure guides, and automation strategies from the frontlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="bg-card border-border hover:border-primary/50 transition-all flex flex-col h-full group">
                {post.featured_image && (
                  <div className="aspect-video w-full overflow-hidden border-b border-border">
                    <img 
                      src={post.featured_image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-muted-foreground">
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {formatDate(post.published_at || post.created_at)}</span>
                    {post.category && <Badge variant="outline">{post.category}</Badge>}
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors leading-tight">
                    <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </CardContent>
                <CardFooter className="pt-6 border-t border-border/50 relative z-10">
                  <Link href={`/blog/${post.slug}`} className="text-sm font-mono text-primary flex items-center hover:text-primary/80 transition-colors">
                    DECRYPT_FILE <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-2 py-24 text-center border border-dashed border-border rounded-sm">
              <p className="text-muted-foreground font-mono">NO_DATA_LOGS_FOUND</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
