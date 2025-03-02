import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';
import { query } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  // Get URL parameters for pagination
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  // Check for token in Authorization header or cookies
  const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

  if (!token) {
    logger.warn('Access denied: No token provided.');
    return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { id, role } = decodedToken;
    logger.info(`Decoded Token: User ID = ${id}, Role = ${role}`);

    if (role !== 'doctor') {
      logger.warn(`Access denied: User with role '${role}' attempted to access patient data.`);
      return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
    }

    // Log before query execution
    logger.info(`Fetching test reports for User ID: ${id} (Page ${page}, Limit ${limit})`);

    // First get total count of records for pagination metadata
    const countQuery = `
      SELECT COUNT(*) as total
      FROM test_info
      WHERE user_id = ?
    `;

    let countResult;
    try {
      countResult = await query(countQuery, [id]);
    } catch (dbError) {
      logger.error(`Database Count Query Error: ${dbError.message}`);
      return NextResponse.json({ error: 'Database query failed. Please try again later.' }, { status: 500 });
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Now get the actual data with pagination
    const dataQuery = `
     SELECT 
  t.id, 
  t.symptoms, 
  t.test_by_doctor, 
  t.isApprove, 
  t.approvedBy,
  t.created_at,
  COALESCE(u.gender, 'Not Provided') AS user_gender,  
  u.name AS user_name, 
  u.date_of_birth AS user_dob, 
  a.name AS approved_by_name
    FROM test_info t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN users a ON t.approvedBy = a.id
    WHERE t.approvedBy = ? 
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
    `;

    let results;
    try {
      results = await query(dataQuery, [id, limit, offset]);
    } catch (dbError) {
      logger.error(`Database Query Error: ${dbError.message}`);
      return NextResponse.json({ error: 'Database query failed. Please try again later.' }, { status: 500 });
    }

    if (!results || results.length === 0) {
      logger.info(`No test reports found for User ID: ${id} on page ${page}`);
      // If page 1 has no results, return 404. Otherwise, it might just be an empty page
      if (page === 1) {
        return NextResponse.json({ message: 'No test data found for this user.' }, { status: 404 });
      }
    }

    // Return data with pagination metadata
    logger.info(`Successfully retrieved ${results.length} test report(s) for User ID: ${id} (Page ${page}/${totalPages})`);
    return NextResponse.json({
      message: 'Data fetched successfully',
      data: results,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });

  } catch (error) {
    logger.error(`JWT Verification Error: ${error.message}`);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}