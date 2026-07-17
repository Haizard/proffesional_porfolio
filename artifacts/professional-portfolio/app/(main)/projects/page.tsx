import Link from 'next/link'
import { ArrowRight, Download, Lock, Eye, Cpu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'

export const metadata = {
  title: 'Projects',
  description: 'Explore our completed projects — free to download or unlock with a one-time payment.',
}

async function getProjects(): Promise<Project[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/projects`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/categories?type=project`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>
}) {
  const { category, type } = await searchParams
  const [allProjects, categories] = await Promise.all([getProjects(), getCategories()])

  let projects = allProjects
  if (category) projects = projects.filter(p => p.category_id === category)
  if (type === 'free') projects = projects.filter(p => p.is_free)
  if (type === 'paid') projects = projects.filter(p => !p.is_free)

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero */}
        <div className="max-w-3xl mb-16">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="font-mono uppercase tracking-wider">Project_Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Deployed <span className="text-primary font-mono text-glow">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Real systems we've built. Some are free to download. Paid projects unlock full source access.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <Link href="/projects">
            <Badge variant={!type && !category ? 'default' : 'outline'} className="cursor-pointer font-mono px-3 py-1">ALL</Badge>
          </Link>
          <Link href="/projects?type=free">
            <Badge variant={type === 'free' ? 'default' : 'outline'} className="cursor-pointer font-mono px-3 py-1 text-green-400 border-green-400/30">FREE</Badge>
          </Link>
          <Link href="/projects?type=paid">
            <Badge variant={type === 'paid' ? 'default' : 'outline'} className="cursor-pointer font-mono px-3 py-1 text-yellow-400 border-yellow-400/30">PAID</Badge>
          </Link>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/projects?category=${cat.id}`}>
              <Badge variant={category === cat.id ? 'default' : 'outline'} className="cursor-pointer font-mono px-3 py-1">{cat.name.toUpperCase()}</Badge>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-all flex flex-col group overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-muted border-b border-border overflow-hidden relative">
                  {project.featured_image ? (
                    <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                      <Cpu className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  {/* Free / Paid badge */}
                  <div className="absolute top-3 right-3">
                    {project.is_free ? (
                      <span className="flex items-center gap-1 text-xs font-mono bg-green-500/20 text-green-400 border border-green-400/30 px-2 py-1 rounded">
                        <Download className="h-3 w-3" /> FREE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-400/30 px-2 py-1 rounded">
                        <Lock className="h-3 w-3" /> ${project.price}
                      </span>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  {project.category && (
                    <Badge variant="outline" className="w-fit mb-2 font-mono text-xs text-primary border-primary/30">
                      {(project.category as any).name}
                    </Badge>
                  )}
                  <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
                    <Link href={`/projects/${project.slug}`} className="before:absolute before:inset-0">
                      {project.title}
                    </Link>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 text-sm text-muted-foreground line-clamp-2 pb-3">
                  {project.description}
                </CardContent>

                {/* Tech stack */}
                {project.tech_stack?.length > 0 && (
                  <div className="px-6 pb-3 flex flex-wrap gap-1">
                    {project.tech_stack.slice(0, 4).map(t => (
                      <span key={t} className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                    {project.tech_stack.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-500">+{project.tech_stack.length - 4}</span>
                    )}
                  </div>
                )}

                <CardFooter className="pt-4 border-t border-border/50 gap-2 relative z-10">
                  {project.preview_url && (
                    <a href={project.preview_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-primary transition-colors">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </a>
                  )}
                  <Link href={`/projects/${project.slug}`} className="ml-auto flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80 transition-colors">
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-border rounded-sm">
            <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-mono">NO_PROJECTS_FOUND</p>
          </div>
        )}
      </div>
    </div>
  )
}
