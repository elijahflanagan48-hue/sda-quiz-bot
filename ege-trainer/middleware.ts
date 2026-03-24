import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req as typeof req & { auth: { user?: { role: string } } | null }
  const isLoggedIn = !!session?.user
  const isTeacher = session?.user?.role === 'TEACHER'

  const isAuthPage = nextUrl.pathname.startsWith('/auth')
  const isTeacherRoute = nextUrl.pathname.startsWith('/teacher')
  const isProtectedRoute =
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/practice') ||
    nextUrl.pathname.startsWith('/exam') ||
    nextUrl.pathname.startsWith('/history') ||
    nextUrl.pathname.startsWith('/profile') ||
    isTeacherRoute

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl))
  }

  if (isTeacherRoute && isLoggedIn && !isTeacher) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
