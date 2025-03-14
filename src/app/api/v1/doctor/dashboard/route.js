import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
    const token = req.headers.get('authorization') ? .split(' ')[1] || req.cookies.get('accessToken');

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

        // Check if the user is a Doctor
        if (role !== 'doctor') {
            logger.warn(`Access denied: User with role ${role} tried to access doctor dashboard`);
            return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
        }

        // Fetch doctor-specific data from the database
        const doctorData = await query('SELECT name,email,phone_number,city,specialty,designation FROM users WHERE id = ?', [id]);
        if (!doctorData || doctorData.length === 0) {
            logger.warn(`Doctor data not found for user ID: ${id}`);
            return NextResponse.json({ error: 'No data found for this doctor.' }, { status: 404 });
        }

        // Return the doctor data as a response
        return NextResponse.json({ doctorData: doctorData[0] }, { status: 200 });

    } catch (error) {
        logger.error(`Error verifying token: ${error.message}`);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}