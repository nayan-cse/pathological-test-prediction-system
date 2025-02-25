import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';
import { query } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  // Check for token in Authorization header or cookies
  const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

  if (!token) {
    logger.warn('Access denied: User is not logged in');
    return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { id, role } = decodedToken;
    logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

    if (role !== 'patient') {
      logger.warn(`Access denied: User with role ${role} tried to access this resource`);
      return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
    }

    // Fetch data from the database using user_id (from token)
    logger.info(`Fetching test info for user ID: ${id}`);
    const queryString = 'SELECT symptoms,isApprove,created_at FROM test_info WHERE user_id = ?';
    const results = await query(queryString, [id]);

    if (results.length === 0) {
      logger.info(`No test info found for user ID: ${id}`);
      return NextResponse.json({ message: 'No test data found for this user.' }, { status: 404 });
    }

    logger.info(`Successfully fetched test info for user ID: ${id}`);
    return NextResponse.json({ message: 'Data fetched successfully', data: results }, { status: 200 });

  } catch (error) {
    logger.error(`Error verifying token: ${error.message}`);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
