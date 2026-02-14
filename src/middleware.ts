import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

export function middleware(request: NextRequest) {
    // Simple Basic Auth for demonstration purposes
    // In production, use a robust solution like NextAuth.js
    const basicAuth = request.headers.get('authorization');

    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            // Check against environment variables
            if (user === ADMIN_USERNAME && pwd === ADMIN_PASSWORD) {
                return NextResponse.next();
            }
        }

        return new NextResponse('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Bichil Admin Panel"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
