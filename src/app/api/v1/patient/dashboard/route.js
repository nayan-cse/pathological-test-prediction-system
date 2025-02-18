// // src/app/api/v1/dashboard/patient/route.js
// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { query } from '../../../../lib/db';
// import logger from '../../../../lib/logger';

// const JWT_SECRET = process.env.JWT_SECRET;

// export async function GET(req) {
//     const token = req.cookies.get('accessToken');
//     console.log(req);

//     // Check if the token exists
//     if (!token) {
//         logger.warn('Access denied: User is not logged in');
//         return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
//     }

//     try {
//         // Verify the token
//         const decodedToken = jwt.verify(token, JWT_SECRET);
//         const { id, role } = decodedToken;
//         console.log(id, role);
//         // Check if the user is a Patient
//         if (role !== 'Patient') {
//             logger.warn(`Access denied: User with role ${role} tried to access patient dashboard`);
//             return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
//         }

//         // Fetch patient-specific data from the database
//         const patientData = await query('SELECT * FROM patients WHERE user_id = ?', [id]); // Replace 'patients' with your actual table for patient data

//         if (!patientData || patientData.length === 0) {
//             logger.warn(`Patient data not found for user ID: ${id}`);
//             return NextResponse.json({ error: 'No data found for this patient.' }, { status: 404 });
//         }

//         // Return the patient data as a response
//         return NextResponse.json({ patientData: patientData[0] }, { status: 200 });

//     } catch (error) {
//         logger.error(`Error verifying token: ${error.message}`);
//         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//     }
// }
// src/app/api/v1/dashboard/patient/route.js



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

        // Check if the user is a Patient
        if (role !== 'patient') {
            logger.warn(`Access denied: User with role ${role} tried to access patient dashboard`);
            return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
        }

        // Fetch patient-specific data from the database
        const patientData = await query('SELECT name,email,phone_number FROM users WHERE id = ?', [id]); // Replace 'patients' with your actual table for patient data

        if (!patientData || patientData.length === 0) {
            logger.warn(`Patient data not found for user ID: ${id}`);
            return NextResponse.json({ error: 'No data found for this patient.' }, { status: 404 });
        }

        // Return the patient data as a response
        return NextResponse.json({ patientData: patientData[0] }, { status: 200 });

    } catch (error) {
        logger.error(`Error verifying token: ${error.message}`);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
