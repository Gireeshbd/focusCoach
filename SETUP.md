# FlowBoard Setup Guide

## 🚀 Quick Start

This guide will help you set up FlowBoard locally and configure all the necessary services.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)
- A Stripe account (test mode is fine)
- An OpenAI API key

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd focusCoach
npm install
```

## 2. Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings → API
3. Copy the following values:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The `anon` public key
   - `SUPABASE_SERVICE_ROLE_KEY`: The `service_role` secret key (keep this secret!)

### Stripe Setup

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from Developers → API keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your publishable key
   - `STRIPE_SECRET_KEY`: Your secret key
3. Create products and prices for Pro and Elite tiers:
   - Pro Monthly ($12/month)
   - Pro Yearly ($120/year)
   - Elite Monthly ($29/month)
   - Elite Yearly ($290/year)
4. Copy the Price IDs to your `.env.local`:
   - `STRIPE_PRICE_ID_PRO_MONTHLY`
   - `STRIPE_PRICE_ID_PRO_YEARLY`
   - `STRIPE_PRICE_ID_ELITE_MONTHLY`
   - `STRIPE_PRICE_ID_ELITE_YEARLY`
5. Set up webhooks:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `customer.subscription.*`, `checkout.session.completed`, `invoice.payment_*`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to `.env.local` as `OPENAI_API_KEY`

### Other Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 3. Database Setup

### Run the migration

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the SQL script

This will create:
- All database tables (users, tasks, columns, focus_sessions, etc.)
- Row Level Security policies
- Triggers for auto-updates
- Functions for stats calculation

### Enable OAuth Providers (Optional)

To enable Google and GitHub sign-in:

1. Go to Authentication → Providers in Supabase
2. Enable Google:
   - Create OAuth app in Google Cloud Console
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
3. Enable GitHub:
   - Create OAuth app in GitHub Settings → Developer settings
   - Add authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Test the Application

### Create an Account

1. Go to `/auth/signup`
2. Sign up with email or OAuth
3. Verify your email (check Supabase Auth → Users to manually verify if needed)

### Test Subscription Flow

1. Go to `/pricing`
2. Click "Upgrade to Pro"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check that your subscription tier updates in Supabase

### Test AI Coaching

1. Create a task on the board
2. Click the AI coach panel
3. Try different coaching types:
   - Task Breakdown
   - Dopamine Detox
   - Motivational Insight

## 6. Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel will automatically:
- Build your Next.js app
- Set up environment variables (you'll need to add them)
- Deploy to a production URL

### Environment Variables on Vercel

Add all your `.env.local` variables to Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add each variable from `.env.local`

### Update Stripe Webhook

After deploying, update your Stripe webhook URL to:
```
https://your-vercel-domain.vercel.app/api/webhooks/stripe
```

## 7. Post-Deployment

### Configure Supabase Auth

Update allowed redirect URLs in Supabase:
1. Go to Authentication → URL Configuration
2. Add your production URL to:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

### Test Production

1. Sign up on production
2. Test a subscription upgrade
3. Verify webhooks are working (check Stripe Dashboard → Developers → Webhooks)
4. Test AI coaching
5. Test cloud sync across devices

## Troubleshooting

### "Invalid API key" error for AI coaching

- Make sure `OPENAI_API_KEY` is set in your environment variables
- Verify the key works by testing it in OpenAI Playground

### Subscription not updating after Stripe checkout

- Check Stripe webhooks are configured correctly
- Look at webhook logs in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint

### Authentication issues

- Check Supabase project URL and keys are correct
- Verify email templates are configured in Supabase
- Check allowed redirect URLs include your domain

### Database errors

- Verify the migration ran successfully
- Check RLS policies are enabled
- Look at Supabase logs for SQL errors

## Features Checklist

- [x] User authentication (email, Google, GitHub)
- [x] Cloud sync for tasks and sessions
- [x] Subscription tiers (Free, Pro, Elite)
- [x] Stripe payment integration
- [x] AI coaching with usage limits
- [x] Focus sessions with 1-90-0 method
- [x] Stats tracking and streaks
- [x] Pricing page
- [ ] Advanced analytics dashboard (in progress)
- [ ] Gamification (badges, challenges) (in progress)
- [ ] Team workspaces (in progress)
- [ ] Browser extension (planned)
- [ ] Mobile app (planned)
- [ ] Wearable integrations (planned)

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Email: support@flowboard.app (update this)
- Discord: [Join our community](https://discord.gg/flowboard) (update this)

## License

[Your chosen license]
