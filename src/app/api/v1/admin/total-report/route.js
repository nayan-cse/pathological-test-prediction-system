
// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { query } from '../../../../lib/db';
// import logger from '../../../../lib/logger';

// const JWT_SECRET = process.env.JWT_SECRET;

// export async function GET(req) {
//     const token = req.headers.get('authorization') ? .split(' ')[1] || req.cookies.get('accessToken'); // Extract token from Authorization header or cookies

//     // Check if the token exists
//     if (!token) {
//         logger.warn('Access denied: User is not logged in');
//         return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
//     }

//     try {
//         // Verify the token
//         const decodedToken = jwt.verify(token, JWT_SECRET);
//         const { id, role } = decodedToken;
//         logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

//         // Check if the user is an Admin
//         if (role !== 'admin') {
//             logger.warn(`Access denied: User with role ${role} tried to access admin dashboard`);
//             return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
//         }

//         const reportData = await query('SELECT symptoms,test_by_doctor FROM test_info WHERE isApprove =1');
//         if (!reportData || reportData.length === 0) {
//             logger.warn(`Report data not found`);
//             return NextResponse.json({ error: 'No data found.' }, { status: 404 });
//         }

//         // Return the report data as a response
//         return NextResponse.json({ reportData: reportData }, { status: 200 });

//     } catch (error) {
//         logger.error(`Error verifying token: ${error.message}`);
//         return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
//     }
// }


import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
    const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

    if (!token) {
        logger.warn('Access denied: User is not logged in');
        return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const { id, role } = decodedToken;
        logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

        if (role !== 'admin') {
            logger.warn(`Access denied: User with role ${role} tried to access admin dashboard`);
            return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
        }

        // Extract parameters from the request query
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || 1, 10);
        const perPage = parseInt(searchParams.get('perPage') || 25, 10);  // Default perPage = 25
        const offset = (page - 1) * perPage;

        // Constructing the date filter
        let dateFilter = '';
        if (startDate && endDate) {
            dateFilter = `AND created_at BETWEEN '${startDate}' AND '${endDate}'`;
        } else if (startDate) {
            dateFilter = `AND created_at >= '${startDate}'`;
        } else if (endDate) {
            dateFilter = `AND created_at <= '${endDate}'`;
        }

        // Fetching paginated and date-filtered data
        const reportData = await query(`
            SELECT symptoms, test_by_doctor, created_at 
            FROM test_info 
            WHERE isApprove = 1 ${dateFilter}
            LIMIT ${perPage} OFFSET ${offset}
        `);

        if (!reportData || reportData.length === 0) {
            logger.warn(`Report data not found`);
            return NextResponse.json({ error: 'No data found.' }, { status: 404 });
        }

        // Add totalCount to the response
const totalCountResult = await query(`
    SELECT COUNT(*) as count FROM test_info WHERE isApprove = 1 ${dateFilter}
`);
const totalCount = totalCountResult[0]?.count || 0;

return NextResponse.json({ reportData, page, perPage, totalCount }, { status: 200 });


    } catch (error) {
        logger.error(`Error verifying token: ${error.message}`);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
