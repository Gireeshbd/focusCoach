import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, billing }: { tier: 'pro' | 'elite'; billing: 'monthly' | 'yearly' } = await req.json()

    // Determine price ID
    let priceId: string
    if (tier === 'pro') {
      priceId = billing === 'monthly' ? STRIPE_PRICES.pro_monthly : STRIPE_PRICES.pro_yearly
    } else {
      priceId = billing === 'monthly' ? STRIPE_PRICES.elite_monthly : STRIPE_PRICES.elite_yearly
    }

    // Get or create Stripe customer
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = userProfile?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userProfile?.email || user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Update user with customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
