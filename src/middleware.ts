import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const preferredLanguage = cookies().get('preferredLanguage')?.value || 'fa'

  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/api') || //  exclude all API routes
    pathname.startsWith('/static') || // exclude static files
    pathname.includes('.') || // exclude all files in the public folder
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  const langInPath = pathname.split('/')[1]

  // If the path does not already contain a language, redirect based on the cookie or default language
  if (langInPath !== 'fa' && langInPath !== 'en') {
    const url = req.nextUrl.clone()

    url.pathname = `/${preferredLanguage}/${pathname}`

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
