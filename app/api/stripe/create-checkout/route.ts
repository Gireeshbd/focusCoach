import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PRICING } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

// Validation schemas for input parameters
const VALID_TIERS = ['pro', 'elite'] as const;
const VALID_BILLING = ['monthly', 'yearly'] as const;

type SubscriptionTier = typeof VALID_TIERS[number];
type BillingInterval = typeof VALID_BILLING[number];

function validateCheckoutParams(body: any): {
  valid: boolean;
  tier?: SubscriptionTier;
  billing?: BillingInterval;
  error?: string;
} {
  // Check if body exists
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  // Validate tier
  if (!body.tier || !VALID_TIERS.includes(body.tier)) {
    return { valid: false, error: 'Invalid tier. Must be "pro" or "elite"' };
  }

  // Validate billing
  if (!body.billing || !VALID_BILLING.includes(body.billing)) {
    return { valid: false, error: 'Invalid billing interval. Must be "monthly" or "yearly"' };
  }

  return {
    valid: true,
    tier: body.tier,
    billing: body.billing,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validation = validateCheckoutParams(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { tier, billing } = validation;
    if (!tier || !billing) {
      return NextResponse.json(
        { error: 'Missing tier or billing parameter' },
        { status: 400 }
      );
    }

    // Determine price ID with validation
    let priceId: string | null = null;
    if (tier === 'pro') {
      priceId = billing === 'monthly' ? STRIPE_PRICES.pro_monthly : STRIPE_PRICES.pro_yearly;
    } else if (tier === 'elite') {
      priceId = billing === 'monthly' ? STRIPE_PRICES.elite_monthly : STRIPE_PRICES.elite_yearly;
    }

    // Validate price ID exists
    if (!priceId || priceId === '') {
      console.error('Missing Stripe price ID for:', { tier, billing });
      return NextResponse.json(
        { error: 'Pricing configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer (with current subscription tier)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('stripe_customer_id, email, subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Prevent downgrade from Elite to Pro
    if (userProfile.subscription_tier === 'elite' && tier === 'pro') {
      return NextResponse.json(
        { error: 'Cannot downgrade from Elite to Pro. Please cancel your current subscription first.' },
        { status: 400 }
      );
    }

    // Prevent duplicate subscriptions for active subscribers
    if (
      userProfile.subscription_status === 'active' &&
      userProfile.subscription_tier === tier
    ) {
      return NextResponse.json(
        { error: 'You already have an active subscription for this tier.' },
        { status: 400 }
      );
    }

    let customerId = userProfile.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer with error handling
      try {
        const customer = await stripe.customers.create({
          email: userProfile.email || user.email,
          metadata: {
            user_id: user.id,
            tier: tier, // Track requested tier in metadata
          },
        })
        customerId = customer.id

        // Update user with customer ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)

        if (updateError) {
          console.error('Failed to update user with Stripe customer ID:', updateError);
          // Don't fail the request, Stripe customer is created
        }
      } catch (stripeError: any) {
        console.error('Stripe customer creation error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create payment customer. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Validate customerId before proceeding
    if (!customerId) {
      console.error('Customer ID missing after creation/fetch');
      return NextResponse.json(
        { error: 'Failed to process customer information' },
        { status: 500 }
      );
    }

    // Create checkout session with comprehensive error handling
    try {
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
            tier: tier,
            billing: billing,
          },
        },
      })

      // Validate session was created successfully
      if (!session || !session.id || !session.url) {
        console.error('Incomplete Stripe session:', session);
        return NextResponse.json(
          { error: 'Failed to create checkout session' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        tier,
        billing,
      })
    } catch (stripeError: any) {
      console.error('Stripe checkout session creation error:', stripeError);
      return NextResponse.json(
        { error: stripeError.message || 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
