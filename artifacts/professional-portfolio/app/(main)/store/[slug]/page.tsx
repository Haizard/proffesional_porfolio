import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { getProductBySlug } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { AddToCartBtn } from './AddToCartBtn'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Not Found' }
  return { title: product.name, description: product.description }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/store" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-12 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_ARMORY
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-sm border border-border overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <img src="/custom-pc.jpg" alt="Fallback" className="w-full h-full object-cover opacity-80" />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-sm border border-border overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-4 font-mono">{product.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tighter mb-4">{product.name}</h1>
            
            <div className="flex items-end gap-4 mb-6">
              <span className="text-3xl font-bold font-mono text-primary">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through mb-1">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              {product.description}
            </p>

            <div className="bg-card border border-border rounded-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-sm text-muted-foreground">STATUS</span>
                {product.stock > 0 ? (
                  <Badge variant="outline" className="text-green-400 border-green-400/30">IN_STOCK</Badge>
                ) : (
                  <Badge variant="danger">OUT_OF_STOCK</Badge>
                )}
              </div>
              <AddToCartBtn product={product} disabled={product.stock <= 0} />
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold mb-4 font-mono uppercase tracking-wider text-sm border-b border-border pb-2">Core_Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-3 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="font-bold mb-4 font-mono uppercase tracking-wider text-sm border-b border-border pb-2">Technical_Specs</h3>
                <div className="grid grid-cols-1 divide-y divide-border border border-border rounded-sm">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex py-3 px-4 text-sm">
                      <span className="w-1/3 text-muted-foreground font-mono">{key}</span>
                      <span className="w-2/3 font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
