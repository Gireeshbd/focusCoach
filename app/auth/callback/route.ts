import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // CRITICAL: Create redirect response that preserves auth cookies
      const redirectUrl = `${origin}${redirectTo}`
      const response = NextResponse.redirect(redirectUrl)

      // Get all cookies set by Supabase (auth tokens, refresh tokens, etc.)
      const cookieStore = await cookies()
      const allCookies = cookieStore.getAll()

      // Explicitly forward all cookies to prevent auth token loss
      allCookies.forEach(cookie => {
        response.cookies.set({
          name: cookie.name,
          value: cookie.value,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: cookie.name.includes('auth'), // Auth tokens should be httpOnly
        })
      })

      return response
    }

    // Log error for debugging
    console.error('OAuth callback error:', error)
  }

  // Return the user to an error page with instructions
  const errorResponse = NextResponse.redirect(`${origin}/auth/auth-code-error`)

  // Preserve cookies even on error
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  allCookies.forEach(cookie => {
    errorResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  })

  return errorResponse
}
