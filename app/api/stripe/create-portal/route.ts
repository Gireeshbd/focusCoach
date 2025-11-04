import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
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

    // Get user's Stripe customer ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userProfile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      )
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
