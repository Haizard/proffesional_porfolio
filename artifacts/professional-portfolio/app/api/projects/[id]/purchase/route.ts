import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required to purchase' }, { status: 401 })

  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projError || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (project.is_free) return NextResponse.json({ error: 'Project is free' }, { status: 400 })

  // Check already purchased
  const { data: existing } = await supabase
    .from('project_purchases')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('project_id', id)
    .single()

  if (existing?.status === 'paid') {
    return NextResponse.json({ already_purchased: true, download_url: project.download_url })
  }

  // Create Stripe checkout session
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(stripeKey)

  const origin = request.headers.get('origin') || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: Math.round((project.price ?? 0) * 100),
        product_data: {
          name: project.title,
          description: project.description,
          images: project.featured_image ? [project.featured_image] : [],
        },
      },
      quantity: 1,
    }],
    metadata: { project_id: id, user_id: user.id },
    success_url: `${origin}/projects/${project.slug}?purchased=true`,
    cancel_url: `${origin}/projects/${project.slug}`,
  })

  // Record pending purchase
  const adminClient = await createAdminClient()
  await adminClient.from('project_purchases').upsert({
    user_id: user.id,
    project_id: id,
    stripe_session_id: session.id,
    amount: project.price,
    status: 'pending',
  }, { onConflict: 'user_id,project_id' })

  return NextResponse.json({ checkout_url: session.url })
}
