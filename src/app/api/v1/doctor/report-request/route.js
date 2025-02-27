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
      logger.warn(`Access denied: User with role '${role}' attempted to access doctor data.`);
      return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
    }

    // Log before query execution
    logger.info(`Fetching test reports for User ID: ${id} (Page ${page}, Limit ${limit})`);

    // First get total count of records for pagination metadata
    const countQuery = `
      SELECT COUNT(*) as total
      FROM test_info
      WHERE user_id = ? AND isApprove = 0
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
    t.test_by_model,  
    t.created_at,
    COALESCE(u.gender, 'Not Provided') AS user_gender,  
    u.name AS user_name, 
    u.date_of_birth AS user_dob
    FROM test_info t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.isApprove = 0
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
;
    `;

    let results;
    try {
      results = await query(dataQuery, [limit, offset]);
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

export async function POST(req) {
  try {
    // Retrieve the token from Authorization header
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      logger.warn('Access denied: No token provided.');
      return NextResponse.json({ error: 'You must be logged in to approve a report.' }, { status: 401 });
    }
    
    // Verify the token and decode it
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { id: doctorId } = decodedToken;
    
    // Get request body
    const { reportId, testByModel } = await req.json();
    // Validate the data
    if (!reportId || !doctorId || !testByModel) {
      return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
    }
    
    // Check if the doctor is authorized (e.g., by checking the role)
    if (!doctorId || decodedToken.role !== 'doctor') {
      logger.warn(`Access denied: User with role '${decodedToken.role}' tried to approve a report.`);
      return NextResponse.json({ error: 'You are not authorized to approve this report.' }, { status: 403 });
    }
    
    // First check if report exists and if it's already approved
    const checkQuery = `SELECT isApprove FROM test_info WHERE id = ?`;
    let checkResult;
    
    try {
      checkResult = await query(checkQuery, [reportId]);
    } catch (dbError) {
      logger.error(`Database Error during check: ${dbError.message}`);
      return NextResponse.json({ error: 'Database query failed. Please try again later.' }, { status: 500 });
    }
    
    // If no record found
    if (checkResult.length === 0) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }
    
    // Update the report with the new test recommendation and set isApprove = 1
    const updateQuery = `
      UPDATE test_info
      SET test_by_doctor = ?, isApprove = 1, approvedBy = ? 
      WHERE id = ?
    `;
    
    let result;
    try {
      result = await query(updateQuery, [testByModel, doctorId, reportId]);
    } catch (dbError) {
      logger.error(`Database Error: ${dbError.message}`);
      return NextResponse.json({ error: 'Database query failed. Please try again later.' }, { status: 500 });
    }
    
    // Log success
    logger.info(`Report ID ${reportId} updated and approved by Doctor ID ${doctorId}`);
    
    // Return success response
    return NextResponse.json({
      message: 'Report updated and approved successfully',
      data: { reportId, doctorId, testByModel }
    }, { status: 200 });
  } catch (error) {
    // Catch any other errors (e.g., JWT verification errors)
    logger.error(`Error during approval process: ${error.message}`);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } else if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}