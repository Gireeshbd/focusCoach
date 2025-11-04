import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

// Price IDs from environment variables
export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
  pro_yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || '',
  elite_monthly: process.env.STRIPE_PRICE_ID_ELITE_MONTHLY || '',
  elite_yearly: process.env.STRIPE_PRICE_ID_ELITE_YEARLY || '',
}

// Pricing information
export const PRICING = {
  pro: {
    monthly: 12,
    yearly: 120, // 2 months free
  },
  elite: {
    monthly: 29,
    yearly: 290, // 2 months free
  },
}
