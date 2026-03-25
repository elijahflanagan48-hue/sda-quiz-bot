import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const session = await auth()
  const { nextUrl } = req
  const isLoggedIn = !!session?.user
  const isTeacher = (session?.user as { role?: string })?.role === 'TEACHER'

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
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
