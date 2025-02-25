import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;

// POST method (forwarding request to Flask API)
export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

  // Check if the token exists
  if (!token) {
    logger.warn('Access denied: User is not logged in');
    return NextResponse.json({ error: 'You must be logged in to make a report.' }, { status: 401 });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { id, role } = decodedToken;
    logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

    // Check if the user is authorized (for example, only "patient" can make reports)
    if (role !== 'patient') {
      logger.warn(`Access denied: User with role ${role} tried to access the report API`);
      return NextResponse.json({ error: 'You are not authorized to make this report.' }, { status: 403 });
    }

    // Forward the request to Flask API
    const flaskApiUrl = "http://localhost:5000/predict"; // Flask API URL
    const response = await fetch(flaskApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Send JWT token to Flask API for validation
      },
      body: JSON.stringify(await req.json()), // Forward the body of the request to Flask
    });

    // Get the response from Flask
    const data = await response.json();

    // Return the response back to the client
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    logger.error(`Error verifying token: ${error.message}`);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

// GET method (for handling data retrieval or any other logic)
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

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

    // For example, if you want to return some user data based on the role
    if (role !== 'patient') {
      logger.warn(`Access denied: User with role ${role} tried to access this resource`);
      return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
    }

    // Return some data (for example, patient data)
    return NextResponse.json({ message: 'Data fetched successfully', id, role }, { status: 200 });

  } catch (error) {
    logger.error(`Error verifying token: ${error.message}`);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
