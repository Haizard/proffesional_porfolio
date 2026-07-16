import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getProducts } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

export const metadata = {
  title: 'Hardware Store',
  description: 'Custom PCs, AI machines, and servers.',
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const allProducts = await getProducts()
  
  const resolvedParams = await searchParams
  const category = resolvedParams?.category
  
  const products = category 
    ? allProducts.filter(p => p.category === category)
    : allProducts

  const categories = Array.from(new Set(allProducts.map(p => p.category)))

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Hardware <span className="text-primary font-mono text-glow">Division</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Purpose-built machines for intense workloads. No bloatware. No compromises. Pure performance.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-mono font-bold mb-4 uppercase tracking-wider text-sm border-b border-border pb-2">Hardware_Classes</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/store" 
                    className={`text-sm ${!category ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    [ All Systems ]
                  </Link>
                </li>
                {categories.length > 0 ? categories.map((cat) => (
                  <li key={cat}>
                    <Link 
                      href={`/store?category=${cat}`}
                      className={`text-sm ${category === cat ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {String(cat).replace('-', ' ').toUpperCase()}
                    </Link>
                  </li>
                )) : (
                  <>
                    <li><Link href="/store?category=ai-machine" className="text-sm text-muted-foreground hover:text-foreground">AI MACHINES</Link></li>
                    <li><Link href="/store?category=business-pc" className="text-sm text-muted-foreground hover:text-foreground">WORKSTATIONS</Link></li>
                    <li><Link href="/store?category=gaming-pc" className="text-sm text-muted-foreground hover:text-foreground">GAMING RIGS</Link></li>
                    <li><Link href="/store?category=server" className="text-sm text-muted-foreground hover:text-foreground">SERVERS</Link></li>
                  </>
                )}
              </ul>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="bg-card border-border hover:border-primary/50 transition-all flex flex-col h-full group overflow-hidden">
                    <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <img 
                          src="/custom-pc.jpg" 
                          alt="Fallback"
                          className="w-full h-full object-cover opacity-50 grayscale transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                      {!product.stock && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                          <Badge variant="danger" className="font-mono">OUT_OF_STOCK</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur font-mono text-xs">{product.category}</Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{product.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono">{formatPrice(product.price)}</span>
                        {product.compare_at_price && (
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 mt-auto">
                      <Link href={`/store/${product.slug}`} className="w-full">
                        <Button variant="outline" className="w-full font-mono">
                          VIEW_SPECS
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-24 text-center border border-dashed border-border rounded-sm">
                  <p className="text-muted-foreground font-mono">NO_HARDWARE_FOUND</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
