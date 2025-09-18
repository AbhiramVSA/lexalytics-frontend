import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(req: NextRequest) {
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next|api).*)'],
}
