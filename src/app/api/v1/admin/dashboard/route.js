// src/app/api/v1/dashboard/admin/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
    const token = req.headers.get('authorization') ? .split(' ')[1] || req.cookies.get('accessToken'); // Extract token from Authorization header or cookies

    // Check if the token exists
    if (!token) {
        logger.warn('Access denied: User is not logged in');
        return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const { id, role } = decodedToken;
        logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

        // Check if the user is an Admin
        if (role !== 'admin') {
            logger.warn(`Access denied: User with role ${role} tried to access admin dashboard`);
            return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
        }

        // Fetch admin-specific data from the database
        const adminData = await query('SELECT name,email,phone_number FROM users WHERE id = ?', [id]); // Replace 'admins' with your actual table for admin data

        if (!adminData || adminData.length === 0) {
            logger.warn(`Admin data not found for user ID: ${id}`);
            return NextResponse.json({ error: 'No data found for this admin.' }, { status: 404 });
        }

        // Return the admin data as a response
        return NextResponse.json({ adminData: adminData[0] }, { status: 200 });

    } catch (error) {
        logger.error(`Error verifying token: ${error.message}`);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
