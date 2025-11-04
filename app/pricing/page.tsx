'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      router.push('/auth/login?redirectTo=/pricing')
      return
    }

    setLoadingTier(tier)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billing: billingInterval }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout')
      setLoadingTier(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open billing portal')
    }
  }

  const currentTier = profile?.subscription_tier || 'free'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Flow Path
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Transform your productivity with AI-powered focus management
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-slate-800 rounded-full p-1 gap-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="bg-green-500 text-white">
                Save 16%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Tier */}
          <Card className="relative border-2 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-gray-400" />
                <CardTitle>Free</CardTitle>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400 ml-2">forever</span>
              </div>
              <CardDescription>Perfect for trying out FlowBoard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Unlimited local tasks & columns</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Basic focus sessions (1-90-0 method)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">30 days of session history</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">5 AI coaching requests/month</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Basic stats & streaks</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {currentTier === 'free' ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/">Get Started</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-2 border-purple-500 shadow-lg shadow-purple-500/20 scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <CardTitle>Pro</CardTitle>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  ${billingInterval === 'monthly' ? '12' : '10'}
                </span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
              <CardDescription>
                For serious flow athletes and knowledge workers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm font-medium">Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">☁️ Cloud sync across all devices</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">🤖 Unlimited AI coaching (included)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">📊 Advanced analytics & heatmaps</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">📈 Unlimited session history</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">🎯 All challenges & badges</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">🤝 Accountability buddy pairing</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">🛡️ Browser distraction blocker</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                  <span className="text-sm">📚 Flow Recipes template library</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {currentTier === 'pro' ? (
                <Button className="w-full" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              ) : currentTier === 'elite' ? (
                <Button className="w-full" variant="outline" disabled>
                  Downgrade to Pro
                </Button>
              ) : (
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleSubscribe('pro')}
                  disabled={!!loadingTier}
                >
                  {loadingTier === 'pro' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Upgrade to Pro • $${billingInterval === 'monthly' ? '12' : '120'}`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Elite Tier */}
          <Card className="relative border-2 border-yellow-500 shadow-lg shadow-yellow-500/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1">
                Premium
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <CardTitle>Elite</CardTitle>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  ${billingInterval === 'monthly' ? '29' : '24'}
                </span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
              <CardDescription>
                For teams and power users who demand the best
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm font-medium">Everything in Pro, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">🧠 Adaptive AI coach (learns your brain)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">📧 Weekly AI insights emails</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">👥 Team workspaces (up to 10 members)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">📊 Manager dashboard & team metrics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">🎨 AI custom template generator</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">⌚ Wearable integrations (Oura, Apple Watch)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">🔗 Calendar & Slack integrations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm">💬 Priority support (2h response)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {currentTier === 'elite' ? (
                <Button className="w-full" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={() => handleSubscribe('elite')}
                  disabled={!!loadingTier}
                >
                  {loadingTier === 'elite' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Upgrade to Elite • $${billingInterval === 'monthly' ? '29' : '290'}`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* FAQ or additional info */}
        <div className="text-center text-gray-400 text-sm">
          <p>All plans include a 14-day money-back guarantee • Cancel anytime</p>
          <p className="mt-2">
            Questions? <Link href="/contact" className="text-purple-400 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
