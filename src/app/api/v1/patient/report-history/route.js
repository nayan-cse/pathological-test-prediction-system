// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import logger from '../../../../lib/logger';
// import { query } from '../../../../lib/db';

// const JWT_SECRET = process.env.JWT_SECRET;

// export async function GET(req) {
//   // Check for token in Authorization header or cookies
//   const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

//   if (!token) {
//     logger.warn('Access denied: User is not logged in');
//     return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
//   }

//   try {
//     // Verify the token
//     const decodedToken = jwt.verify(token, JWT_SECRET);
//     const { id, role } = decodedToken;
//     logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

//     if (role !== 'patient') {
//       logger.warn(`Access denied: User with role ${role} tried to access this resource`);
//       return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
//     }

//     // Fetch data from the database using user_id (from token)
//     logger.info(`Fetching test info for user ID: ${id}`);
//     const queryString = 'SELECT symptoms,isApprove,created_at FROM test_info WHERE user_id = ?';
//     const results = await query(queryString, [id]);

//     if (results.length === 0) {
//       logger.info(`No test info found for user ID: ${id}`);
//       return NextResponse.json({ message: 'No test data found for this user.' }, { status: 404 });
//     }

//     logger.info(`Successfully fetched test info for user ID: ${id}`);
//     return NextResponse.json({ message: 'Data fetched successfully', data: results }, { status: 200 });

//   } catch (error) {
//     logger.error(`Error verifying token: ${error.message}`);
//     return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
//   }
// }

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';
import { query } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
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

    if (role !== 'patient') {
      logger.warn(`Access denied: User with role '${role}' attempted to access patient data.`);
      return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
    }

    // Log before query execution
    logger.info(`Fetching test reports for User ID: ${id}`);

    const queryString = `
      SELECT 
        t.id, 
        t.symptoms, 
        t.test_by_model, 
        t.test_by_doctor, 
        t.isApprove, 
        t.approvedBy,
        u.city,
        t.created_at,
        COALESCE(u.gender, 'Not Provided') AS user_gender,  
        u.name AS user_name, 
        u.date_of_birth AS user_dob, 
        a.name AS approved_by_name,
        COALESCE(a.specialty, 'N/A') AS approved_by_specialty, 
        COALESCE(a.designation, 'N/A') AS approved_by_designation  
      FROM test_info t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.approvedBy = a.id
      WHERE t.user_id = ?
    `;

    let results;
    try {
      results = await query(queryString, [id]);
    } catch (dbError) {
      logger.error(`Database Query Error: ${dbError.message}`);
      return NextResponse.json({ error: 'Database query failed. Please try again later.' }, { status: 500 });
    }

    if (!results || results.length === 0) {
      logger.info(`No test reports found for User ID: ${id}`);
      return NextResponse.json({ message: 'No test data found for this user.' }, { status: 404 });
    }

    logger.info(`Successfully retrieved ${results.length} test report(s) for User ID: ${id}`);
    return NextResponse.json({ message: 'Data fetched successfully', data: results }, { status: 200 });

  } catch (error) {
    logger.error(`JWT Verification Error: ${error.message}`);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
