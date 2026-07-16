import Link from 'next/link'
import { Terminal } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="font-mono text-xl font-bold tracking-tighter text-primary flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            haithammisape_
          </Link>
          <p className="text-sm text-muted-foreground">
            Transforming businesses with AI automation, custom software, and purpose-built hardware. Your competitive edge, engineered.
          </p>
        </div>
        
        <div>
          <h4 className="font-mono font-bold mb-4 uppercase tracking-wider text-sm">Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/services?category=ai-automation" className="hover:text-primary transition-colors">AI Automation</Link></li>
            <li><Link href="/services?category=saas-development" className="hover:text-primary transition-colors">SaaS Development</Link></li>
            <li><Link href="/services?category=forex-bots" className="hover:text-primary transition-colors">Forex Bots</Link></li>
            <li><Link href="/services" className="hover:text-primary transition-colors">All Services</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-bold mb-4 uppercase tracking-wider text-sm">Hardware</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/store?category=ai-machines" className="hover:text-primary transition-colors">AI Machines</Link></li>
            <li><Link href="/store?category=business-pc" className="hover:text-primary transition-colors">Business PCs</Link></li>
            <li><Link href="/store?category=server-setup" className="hover:text-primary transition-colors">Servers</Link></li>
            <li><Link href="/store" className="hover:text-primary transition-colors">Store</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-bold mb-4 uppercase tracking-wider text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/blog" className="hover:text-primary transition-colors">Intel / Blog</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/account" className="hover:text-primary transition-colors">Client Portal</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground font-mono">
        <p>© {new Date().getFullYear()} haithammisape. All rights reserved.</p>
        <p className="mt-2 md:mt-0">SYSTEM_STATUS: ONLINE</p>
      </div>
    </footer>
  )
}
