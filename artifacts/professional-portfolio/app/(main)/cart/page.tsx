'use client'

import Link from 'next/link'
import { Trash2, ArrowRight, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-border">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4 font-mono">CART_EMPTY</h1>
          <p className="text-muted-foreground mb-8">Your hardware selection is empty.</p>
          <Link href="/store">
            <Button size="lg" className="font-mono">
              ACCESS_STORE
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tighter mb-12 font-mono">
          CHECKOUT_MANIFEST
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border rounded-sm bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-mono text-muted-foreground font-normal">ITEM</th>
                    <th className="text-center p-4 font-mono text-muted-foreground font-normal">QTY</th>
                    <th className="text-right p-4 font-mono text-muted-foreground font-normal">PRICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.product.id} className="group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-muted rounded border border-border overflow-hidden shrink-0 hidden sm:block">
                            {item.product.images?.[0] ? (
                              <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted" />
                            )}
                          </div>
                          <div>
                            <Link href={`/store/${item.product.slug}`} className="font-bold hover:text-primary transition-colors">
                              {item.product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground font-mono mt-1">{item.product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right align-middle font-mono">
                        <div className="flex flex-col items-end gap-2">
                          <span>{formatPrice(item.product.price * item.quantity)}</span>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="text-xs text-red-500/70 hover:text-red-500 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> REMOVE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-sm p-6 sticky top-24">
              <h3 className="font-mono font-bold text-lg mb-6 border-b border-border pb-4">SUMMARY</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono text-primary text-xs border border-primary/30 px-2 py-0.5 rounded bg-primary/10">CALCULATED_LATER</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="font-mono text-xl">{formatPrice(total())}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button className="w-full font-mono h-12" size="lg">
                  PROCEED_TO_CHECKOUT <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
