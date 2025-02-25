import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('accessToken') || req.headers.get('authorization')?.split(' ')[1]; // Extract token from cookies or Authorization header

    // Check if the user is trying to access login or register page without being logged in
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')
    ) {
        if (token) {
            try {
                // If the token is valid, redirect to the user's dashboard based on their role
                const decodedToken = jwt.verify(token, JWT_SECRET);
                const { role } = decodedToken;

                if (role === 'patient') {
                    return NextResponse.redirect('/patient/dashboard');
                } else if (role === 'doctor') {
                    return NextResponse.redirect('/doctor/dashboard');
                } else if (role === 'admin') {
                    return NextResponse.redirect('/admin/dashboard');
                }
            } catch (error) {
                // If token is invalid, allow access to login/register
                return NextResponse.next();
            }
        } else {
            return NextResponse.next();
        }
    }

    // If the user is not logged in, redirect to login page
    if (!token) {
        return NextResponse.redirect('/login');
    }

    try {
        // Verify token and extract user details
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const { role, id } = decodedToken;

        // Check if the user has the correct role for the respective dashboard
        if (pathname.startsWith('/patient') && role !== 'patient') {
            return NextResponse.json({ error: 'Forbidden: You are not authorized to access this page.' }, { status: 403 });
        }

        if (pathname.startsWith('/doctor') && role !== 'doctor') {
            return NextResponse.json({ error: 'Forbidden: You are not authorized to access this page.' }, { status: 403 });
        }

        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: You are not authorized to access this page.' }, { status: 403 });
        }

        // Allow the request to proceed
        return NextResponse.next();
    } catch (error) {
        // If token is invalid, redirect to login page
        return NextResponse.redirect('/login');
    }
}

export const config = {
    matcher: [
        '/patient/:path*',
        '/doctor/:path*',
        '/admin/:path*',
        '/login',
        '/register',
    ],
};
