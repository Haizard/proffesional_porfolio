import { NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const supabase = await createAdminClient()

    // Create the order in Supabase
    const { data: order } = await supabase
      .from('orders')
      .insert({
        customer_email: session.customer_email ?? '',
        customer_name: session.metadata?.customer_name ?? '',
        user_id: session.metadata?.user_id || null,
        status: 'paid',
        total: (session.amount_total ?? 0) / 100,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        shipping_address: session.shipping_details?.address ?? null,
      })
      .select()
      .single()

    if (order) {
      // Fetch line items and create order_items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const orderItems = lineItems.data.map((item) => ({
        order_id: order.id,
        product_name: item.description ?? '',
        product_image: null,
        product_id: null,
        quantity: item.quantity ?? 1,
        price: (item.amount_total ?? 0) / 100,
      }))
      await supabase.from('order_items').insert(orderItems)
    }
  }

  return NextResponse.json({ received: true })
}
