import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/api') ||
        PUBLIC_FILE.test(pathname) ||
        pathname === '/_next' ||
        pathname.startsWith('/_next')
    ) {
        return NextResponse.next()
    }

    const token = req.cookies.get('authToken')?.value
    if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next|api).*)'],
}
