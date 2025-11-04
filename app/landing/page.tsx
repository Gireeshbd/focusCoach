'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap, Brain, Target, TrendingUp, Users, Shield,
  Check, Star, ArrowRight, Sparkles, Crown, Trophy,
  Clock, BarChart, Flame, MessageSquare
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          {/* Announcement bar */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 px-4 py-2">
              <Sparkles className="h-3 w-3 mr-2 inline" />
              New: AI-Powered Flow Coaching
            </Badge>
          </div>

          {/* Hero content */}
          <div className="text-center space-y-8 mb-16">
            <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight">
              Master Deep Work.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Achieve Flow State.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              FlowBoard combines neuroscience-backed methods, AI coaching, and gamification
              to help you achieve *real* deep work—not just organize tasks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-500 text-purple-300 hover:bg-purple-500/10">
                <Link href="/pricing">
                  See Pricing
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10,000+ focus athletes</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>1M+ hours of deep work</span>
              </div>
            </div>
          </div>

          {/* Hero image placeholder */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/20 shadow-2xl shadow-purple-500/20">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <p className="text-white text-lg">🎬 Product Demo Video</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to master focus
            </h2>
            <p className="text-xl text-gray-300">
              Built for knowledge workers, creators, and teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/10">
                    <Brain className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">AI Flow Coach</h3>
                </div>
                <p className="text-gray-400">
                  Get personalized coaching for task breakdown, dopamine detox, and flow optimization.
                  Learns your patterns over time.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">1-90-0 Deep Work</h3>
                </div>
                <p className="text-gray-400">
                  Science-backed method: 1 minute prep, 90 minutes deep focus, 0 distractions.
                  Immersive full-screen mode.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10">
                    <BarChart className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Advanced Analytics</h3>
                </div>
                <p className="text-gray-400">
                  Hourly heatmaps, task velocity, distraction patterns, energy curves, and benchmarks
                  against top performers.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-500/10">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Gamification</h3>
                </div>
                <p className="text-gray-400">
                  Weekly challenges, seasonal leagues, achievement badges, and streaks.
                  Make focus addictive (in a good way).
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Distraction Blocker</h3>
                </div>
                <p className="text-gray-400">
                  Browser extension blocks time-wasting sites during sessions. AI detects your common distractions.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-pink-500/10">
                    <Users className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Team Workspaces</h3>
                </div>
                <p className="text-gray-400">
                  Shared boards, team focus leaderboards, manager dashboard. Build a focus-first culture.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your journey to flow mastery
            </h2>
            <p className="text-xl text-gray-300">
              Simple 4-step process to transform your productivity
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Tasks', desc: 'Build your Kanban board with tasks and columns', icon: Target },
              { step: '2', title: 'AI Breakdown', desc: 'Get AI coaching to optimize for flow state', icon: Brain },
              { step: '3', title: 'Deep Focus', desc: 'Enter immersive 90-min flow sessions', icon: Zap },
              { step: '4', title: 'Track Progress', desc: 'Analyze patterns, earn badges, level up', icon: TrendingUp },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                )}
                <div className="relative text-center">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by focus athletes worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Software Engineer',
                avatar: '👩‍💻',
                text: 'FlowBoard helped me go from 2 hours of real deep work per day to 6 hours. Game-changer for my career.',
                rating: 5,
              },
              {
                name: 'Marcus Rodriguez',
                role: 'PhD Student',
                avatar: '👨‍🎓',
                text: 'The AI coaching is incredible. It knows when I work best and helps me structure my day around flow.',
                rating: 5,
              },
              {
                name: 'Emily Watson',
                role: 'Content Creator',
                avatar: '✍️',
                text: 'I\'ve tried every productivity app. FlowBoard is the only one that actually helps me DO the work.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to master deep work?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 10,000+ knowledge workers achieving flow state daily
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-500 text-purple-300 hover:bg-purple-500/10">
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>

          <p className="text-sm text-gray-400">
            Free plan available • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">FlowBoard</h3>
              <p className="text-sm text-gray-400">
                Master deep work and achieve flow state with AI-powered focus management.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/pricing" className="hover:text-purple-400">Pricing</Link></li>
                <li><Link href="/analytics" className="hover:text-purple-400">Analytics</Link></li>
                <li><Link href="/auth/signup" className="hover:text-purple-400">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-400">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400">About</a></li>
                <li><a href="#" className="hover:text-purple-400">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-400">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-gray-400">
            © 2025 FlowBoard. All rights reserved. Built with 🧠 for deep work.
          </div>
        </div>
      </footer>
    </div>
  )
}
