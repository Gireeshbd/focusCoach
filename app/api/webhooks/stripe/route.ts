import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(subscription, supabase)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for:', invoice.customer)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, supabase)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const status = subscription.status
  const priceId = subscription.items.data[0]?.price.id

  // Determine tier from price ID
  const tier = determineTier(priceId)

  // Update user in database
  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_tier: tier,
      subscription_status: mapStripeStatus(status),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  console.log(`✅ Subscription ${subscriptionId} updated to ${tier} (${status})`)
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  const customerId = subscription.customer as string

  // Downgrade to free tier
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error canceling user subscription:', error)
    throw error
  }

  console.log(`✅ Subscription ${subscription.id} canceled, user downgraded to free`)
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>
) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const userId = session.client_reference_id // We'll pass user ID here

  if (!userId) {
    console.error('No user ID in checkout session')
    return
  }

  // Get subscription details to determine tier
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id
  const tier = determineTier(priceId)

  // Update user with Stripe info
  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_tier: tier,
      subscription_status: 'active',
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user after checkout:', error)
    throw error
  }

  console.log(`✅ Checkout completed for user ${userId}, tier: ${tier}`)
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createAdminClient>
) {
  const customerId = invoice.customer as string

  // Mark subscription as past_due
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error marking subscription as past_due:', error)
    throw error
  }

  console.log(`⚠️ Payment failed for customer ${customerId}`)
}

function determineTier(priceId: string): 'free' | 'pro' | 'elite' {
  if (
    priceId === process.env.STRIPE_PRICE_ID_PRO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_ID_PRO_YEARLY
  ) {
    return 'pro'
  } else if (
    priceId === process.env.STRIPE_PRICE_ID_ELITE_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_ID_ELITE_YEARLY
  ) {
    return 'elite'
  }
  return 'free'
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'trialing' | null {
  switch (status) {
    case 'active':
      return 'active'
    case 'canceled':
      return 'canceled'
    case 'past_due':
      return 'past_due'
    case 'trialing':
      return 'trialing'
    default:
      return null
  }
}
