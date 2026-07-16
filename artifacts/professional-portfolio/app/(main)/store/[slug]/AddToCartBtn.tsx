'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Product } from '@/types'

export function AddToCartBtn({ product, disabled }: { product: Product, disabled?: boolean }) {
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem(product)
    toast.success(`${product.name} added to cart`, {
      icon: '🛒',
    })
  }

  return (
    <Button 
      size="lg" 
      className="w-full font-mono text-lg h-14" 
      onClick={handleAdd}
      disabled={disabled}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {disabled ? 'UNAVAILABLE' : 'ADD_TO_CART'}
    </Button>
  )
}
