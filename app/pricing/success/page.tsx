import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Sparkles } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to FlowBoard Pro! 🎉</CardTitle>
          <CardDescription>
            Your subscription is now active. Let&apos;s get you set up for maximum productivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              What&apos;s Next?
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Your data will automatically sync to the cloud</li>
              <li>Try the unlimited AI coaching on any task</li>
              <li>Explore advanced analytics in your dashboard</li>
              <li>Set up your accountability buddy (optional)</li>
            </ol>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            You can manage your subscription anytime in Settings
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/settings">Settings</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
