// src/app/api/v1/auth/logout/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    // Extract the token from cookies or Authorization header
    const token = req.cookies.get('accessToken') || req.headers.get('authorization') ? .split(' ')[1];

    // If no token is provided, return an error
    if (!token) {
        logger.warn('Logout failed: No token provided');
        return NextResponse.json({ error: 'No token found, user is not logged in' }, { status: 401 });
    }

    try {
        // Verify the token and extract user ID
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const { id } = decodedToken;

        // Clear the 'accessToken' cookie to log the user out
        const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

        // Set the cookie expiration date in the past to invalidate it
        response.cookies.set('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (over HTTPS)
            sameSite: 'strict', // Can adjust based on your requirements
            expires: new Date(0), // Set expiration to the past to remove the cookie
        });

        // Log the user ID of the person who logged out
        logger.info(`User ID: ${id} logged out successfully`);

        return response;

    } catch (error) {
        // Log the error if the token verification fails
        logger.error(`Logout failed: ${error.message}`);
        return NextResponse.json({ error: 'Failed to log out: Invalid or expired token' }, { status: 500 });
    }
}
