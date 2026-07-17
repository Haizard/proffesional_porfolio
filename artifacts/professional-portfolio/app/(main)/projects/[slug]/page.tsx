import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Lock, Eye, CheckCircle2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CommentSection } from '@/components/comments/CommentSection'
import { ProjectPurchaseBtn } from './ProjectPurchaseBtn'

async function getProject(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/projects/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Not Found' }
  return { title: project.title, description: project.description }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const canDownload = project.is_free || project.has_purchased

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/projects" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-12 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_PROJECTS
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Featured image */}
            {project.featured_image && (
              <div className="aspect-video w-full rounded-sm border border-border overflow-hidden bg-muted">
                <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Header */}
            <div>
              {project.category && (
                <Badge variant="outline" className="mb-4 font-mono text-primary border-primary/30 bg-primary/5">
                  {project.category.name}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">{project.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">{project.description}</p>
            </div>

            {/* Long description */}
            {project.long_description && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">About This Project</h2>
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{project.long_description}</div>
              </div>
            )}

            {/* Tech stack */}
            {project.tech_stack?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((t: string) => (
                    <span key={t} className="text-sm font-mono bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-sm">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t: string) => (
                  <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>
                ))}
              </div>
            )}

            {/* Gallery */}
            {project.images?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.images.map((img: string, i: number) => (
                    <div key={i} className="aspect-video rounded-sm border border-border overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <CommentSection entityType="project" entityId={project.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-sm p-6 shadow-xl space-y-6">
              {/* Price / access */}
              <div>
                {project.is_free ? (
                  <div className="flex items-center gap-2 text-green-400 font-mono font-bold text-xl">
                    <Download className="h-5 w-5" /> FREE DOWNLOAD
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-mono text-muted-foreground mb-1">ONE-TIME ACCESS</div>
                    <div className="text-3xl font-bold font-mono text-primary">${project.price}</div>
                  </div>
                )}
              </div>

              {/* CTA */}
              {project.preview_url && (
                <a href={project.preview_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-border text-sm font-mono py-2.5 rounded-sm hover:border-primary/50 hover:text-primary transition-colors">
                  <Eye className="h-4 w-4" /> Live Preview
                </a>
              )}

              {canDownload && project.download_url ? (
                <a href={project.download_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-black font-mono font-bold text-sm py-3 rounded-sm hover:bg-primary/90 transition-colors">
                  <Download className="h-4 w-4" /> Download Project
                </a>
              ) : !project.is_free && !project.has_purchased ? (
                <ProjectPurchaseBtn projectId={project.id} price={project.price} />
              ) : (
                project.is_free && !project.download_url && (
                  <div className="text-xs font-mono text-muted-foreground text-center p-3 border border-dashed border-border rounded">
                    Download link coming soon
                  </div>
                )
              )}

              {project.has_purchased && (
                <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> Access unlocked
                </div>
              )}

              {/* Info */}
              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between">
                  <span className="font-mono text-muted-foreground text-xs">TYPE</span>
                  <span className="font-mono text-xs">{project.is_free ? 'Open Source' : 'Premium'}</span>
                </div>
                {project.category && (
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground text-xs">CATEGORY</span>
                    <span className="font-mono text-xs">{project.category.name}</span>
                  </div>
                )}
                {project.tech_stack?.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-muted-foreground text-xs">STACK</span>
                    <span className="font-mono text-xs text-right max-w-[60%]">{project.tech_stack.slice(0, 3).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
