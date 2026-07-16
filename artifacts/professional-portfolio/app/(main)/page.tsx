import Link from 'next/link'
import { ArrowRight, Terminal, Cpu, Shield, Zap, Server, Code } from 'lucide-react'
import { getFeaturedServices, getFeaturedProducts, getRecentPosts } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function HomePage() {
  const [services, products, posts] = await Promise.all([
    getFeaturedServices(),
    getFeaturedProducts(),
    getRecentPosts()
  ])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            <Terminal className="mr-2 h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">System Online</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Your competitive edge, <span className="text-primary text-glow font-mono">&lt;engineered/&gt;</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            We transform businesses with AI automation, custom software, and purpose-built performance hardware. Stop doing manual work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/services">
              <Button size="lg" className="w-full sm:w-auto font-mono text-lg">
                INITIALIZE_AGENCY <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/store">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-mono text-lg">
                BROWSE_HARDWARE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Features Bar */}
      <section className="border-y border-border bg-card/30 backdrop-blur-sm py-12 relative z-10">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-primary font-mono mb-2">99.9%</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Uptime</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary font-mono mb-2">24/7</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">AI Operations</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary font-mono mb-2">0ms</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Human Delay</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary font-mono mb-2">100%</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Custom Built</p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Operations & Software</h2>
              <p className="text-muted-foreground max-w-xl">
                We build the systems that run your business. From intelligent AI agents to full-scale SaaS platforms.
              </p>
            </div>
            <Link href="/services" className="hidden md:flex items-center text-primary hover:text-primary/80 transition-colors font-mono">
              VIEW_ALL_SERVICES <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.map((service) => (
                <Card key={service.id} className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/50 transition-all hover:box-glow group">
                  <CardHeader>
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <Code className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/services/${service.slug}`} className="w-full">
                      <Button variant="ghost" className="w-full justify-between font-mono">
                        CONFIGURE <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // Fallback content if API fails
              [
                { icon: <Zap />, title: 'AI Automation', desc: 'Custom n8n workflows and AI agents that run your business 24/7.' },
                { icon: <Code />, title: 'SaaS Development', desc: 'Full-stack application development using cutting edge tech.' },
                { icon: <Shield />, title: 'Forex Bots', desc: 'Algorithmic trading systems with sub-millisecond execution.' },
              ].map((s, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all group">
                  <CardHeader>
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {s.icon}
                    </div>
                    <CardTitle className="text-xl">{s.title}</CardTitle>
                    <CardDescription>{s.desc}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/services`} className="w-full">
                      <Button variant="ghost" className="w-full justify-between font-mono text-muted-foreground group-hover:text-primary">
                        EXPLORE <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Hardware Section with Generated Image */}
      <section className="py-24 bg-card/20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-sm overflow-hidden border border-border shadow-2xl group">
              <img 
                src="/custom-pc.jpg" 
                alt="Custom built hardware" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge variant="outline" className="bg-background/80 backdrop-blur text-primary border-primary/50 mb-3">HARDWARE DIVISION</Badge>
                <h3 className="text-2xl font-bold font-mono">Purpose-Built Machines</h3>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Uncompromised Power</h2>
                <p className="text-muted-foreground text-lg">
                  Software is only as good as the hardware it runs on. We build custom servers, AI workstations, and high-performance rigs engineered for your exact workload.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold font-mono text-lg">AI Training Rigs</h4>
                    <p className="text-muted-foreground">Multi-GPU setups optimized for local LLM inference and deep learning workloads.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold font-mono text-lg">Enterprise Servers</h4>
                    <p className="text-muted-foreground">Rack-mounted compute solutions with enterprise-grade reliability and cooling.</p>
                  </div>
                </div>
              </div>

              <Link href="/store">
                <Button size="lg" className="font-mono">
                  ACCESS_STORE <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/ai-concept.jpg" 
            alt="AI Concept" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Stop Waiting. Start Automating.</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Book a discovery call to discuss your infrastructure and automation needs. We only take on projects where we can guarantee a positive ROI.
          </p>
          <Link href="/contact">
            <Button size="lg" className="font-mono h-14 px-8 text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-shadow">
              INITIATE_CONTACT
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
