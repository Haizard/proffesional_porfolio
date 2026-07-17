import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { getServiceBySlug } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContactForm } from './ContactForm'
import { CommentSection } from '@/components/comments/CommentSection'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Not Found' }
  return { title: service.name, description: service.description }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  
  if (!service) {
    // We render a fallback if not found instead of 404 for demonstration, 
    // but typically you'd call notFound()
    notFound()
  }

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/services" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-12 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_SERVICES
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <Badge variant="outline" className="mb-4 font-mono text-primary border-primary/30 bg-primary/5">{service.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">{service.name}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>

            {service.long_description && (
              <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground max-w-none">
                <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Overview</h2>
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {service.long_description}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-2">Key Capabilities</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start bg-card/50 p-4 rounded-sm border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-3 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-sm p-6 shadow-xl">
              <h3 className="font-mono font-bold text-xl mb-2">Engage System</h3>
              {service.price_from && (
                <p className="text-muted-foreground mb-6">
                  Starting at <span className="text-foreground font-bold font-mono text-lg">${service.price_from}</span>
                </p>
              )}
              
              <div className="border-t border-border pt-6 mt-6">
                <h4 className="font-bold mb-4">Request Deployment</h4>
                <ContactForm serviceCategory={service.category} serviceName={service.name} />
              </div>
            </div>
          </div>
        </div>

        <CommentSection entityType="service" entityId={service.id} />
      </div>
    </div>
  )
}
