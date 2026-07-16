import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { getServices } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Services',
  description: 'AI automation, custom software, and digital solutions.',
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const allServices = await getServices()
  
  // Await searchParams before accessing properties per Next.js 15+ best practices
  const resolvedParams = await searchParams
  const category = resolvedParams?.category
  
  const services = category 
    ? allServices.filter(s => s.category === category)
    : allServices

  const categories = Array.from(new Set(allServices.map(s => s.category)))

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Digital <span className="text-primary font-mono text-glow">Operations</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Engineered solutions for complex business problems. We build the systems that give you an unfair advantage.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-mono font-bold mb-4 uppercase tracking-wider text-sm border-b border-border pb-2">Filter_By_Category</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/services" 
                    className={`text-sm ${!category ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    [ All Services ]
                  </Link>
                </li>
                {categories.length > 0 ? categories.map((cat) => (
                  <li key={cat}>
                    <Link 
                      href={`/services?category=${cat}`}
                      className={`text-sm ${category === cat ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {String(cat).replace('-', ' ').toUpperCase()}
                    </Link>
                  </li>
                )) : (
                  <>
                    <li><Link href="/services?category=ai-automation" className="text-sm text-muted-foreground hover:text-foreground">AI AUTOMATION</Link></li>
                    <li><Link href="/services?category=saas-development" className="text-sm text-muted-foreground hover:text-foreground">SAAS DEV</Link></li>
                    <li><Link href="/services?category=forex-bots" className="text-sm text-muted-foreground hover:text-foreground">FOREX BOTS</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="p-6 bg-card/50 border border-border rounded-sm">
              <h4 className="font-bold mb-2">Need a custom solution?</h4>
              <p className="text-sm text-muted-foreground mb-4">We build bespoke systems that aren't on any menu.</p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="w-full font-mono">
                  CONTACT_US
                </Button>
              </Link>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.length > 0 ? (
                services.map((service) => (
                  <Card key={service.id} className="bg-card border-border hover:border-primary/50 transition-all flex flex-col h-full group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="font-mono">{service.category}</Badge>
                        {service.price_from && (
                          <span className="text-sm font-mono text-muted-foreground">From ${service.price_from}</span>
                        )}
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">{service.name}</CardTitle>
                      <CardDescription className="text-base line-clamp-3 mt-2">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2 mt-4">
                        {service.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-start text-sm text-muted-foreground">
                            <span className="text-primary mr-2 mt-0.5">▹</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-6 border-t border-border/50">
                      <Link href={`/services/${service.slug}`} className="w-full">
                        <Button variant="ghost" className="w-full justify-between font-mono">
                          VIEW_DETAILS <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                // Fallback UI
                <div className="col-span-2 py-24 text-center border border-dashed border-border rounded-sm">
                  <p className="text-muted-foreground font-mono">NO_SERVICES_FOUND_IN_DATABASE</p>
                  <p className="text-sm text-muted-foreground mt-2">Initialize services via Admin panel.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
