import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link to confirm your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Next steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Check your email inbox</li>
              <li>Click the verification link</li>
              <li>Return here to sign in</li>
            </ol>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Didn&apos;t receive an email? Check your spam folder or try signing up again.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">Return to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
