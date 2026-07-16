import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types'

export async function POST(request: Request) {
  try {
    const { items, customerEmail, customerName, shippingAddress } = await request.json() as {
      items: CartItem[]
      customerEmail: string
      customerName: string
      shippingAddress?: Record<string, string>
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: item.product.images?.slice(0, 1) ?? [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }))

    const origin = request.headers.get('origin') ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: customerEmail,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'ZA'] },
      metadata: {
        customer_name: customerName,
        user_id: user?.id ?? '',
        item_count: items.length.toString(),
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
