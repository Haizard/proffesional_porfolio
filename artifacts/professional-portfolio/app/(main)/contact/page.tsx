import { Mail, MapPin, Terminal } from 'lucide-react'
import { ContactForm } from '../services/[slug]/ContactForm'

export const metadata = {
  title: 'Contact',
  description: 'Initiate secure comms with haithammisape.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Establish <span className="text-primary font-mono text-glow">Link</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Ready to automate your operations or build custom hardware? Transmit your parameters below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-card border border-border rounded-sm">
                <Mail className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold font-mono mb-2 text-sm uppercase">Direct_Line</h3>
                <p className="text-muted-foreground text-sm">hello@haithammisape.com</p>
              </div>
              <div className="p-6 bg-card border border-border rounded-sm">
                <Terminal className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold font-mono mb-2 text-sm uppercase">Support_Terminal</h3>
                <p className="text-muted-foreground text-sm">support@haithammisape.com</p>
              </div>
            </div>

            <div className="border-t border-border pt-12">
              <h3 className="text-2xl font-bold mb-6">FAQ</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-primary font-mono text-sm mb-2">Q: WHAT_IS_THE_MINIMUM_ENGAGEMENT?</h4>
                  <p className="text-muted-foreground text-sm">We don't have a minimum, but we only take on projects where we can mathematically prove a positive ROI for your business.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary font-mono text-sm mb-2">Q: DO_YOU_SHIP_HARDWARE_INTERNATIONALLY?</h4>
                  <p className="text-muted-foreground text-sm">Yes, all custom builds are shipped in secure, shock-proof freight crates via priority international courier.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-sm shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <h3 className="text-2xl font-bold mb-2">Transmission Form</h3>
            <p className="text-muted-foreground mb-8 text-sm">All comms are strictly confidential.</p>
            
            <ContactForm serviceCategory="general" serviceName="General Inquiry" />
          </div>

        </div>
      </div>
    </div>
  )
}
