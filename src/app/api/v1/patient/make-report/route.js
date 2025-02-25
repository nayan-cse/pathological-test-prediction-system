import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';
import { query } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to handle errors more gracefully
const handleError = (error, message, statusCode = 500) => {
  logger.error(`Error: ${message}`, { error });
  return NextResponse.json({ error: message }, { status: statusCode });
};

export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

  if (!token) {
    logger.warn('No token provided');
    return handleError(null, 'You must be logged in to make a report.', 401);
  }

  try {
    logger.info('Verifying token');
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { id, role } = decodedToken;

    logger.info(`Token verified for user: ${id}, role: ${role}`);

    if (role !== 'patient') {
      logger.warn(`Unauthorized attempt by user with role: ${role}`);
      return handleError(null, 'You are not authorized to make this report.', 403);
    }

    // Get the request body (symptoms)
    const requestBody = await req.json();
    const symptoms = requestBody.symptoms || [];
    const symptomsString = symptoms.join(',');

    logger.info(`Received symptoms: ${symptomsString}`);

    // Forward the request to Flask API
    const flaskApiUrl = "http://localhost:5000/predict"; // Flask API URL
    logger.info(`Forwarding request to Flask API: ${flaskApiUrl}`);
    const response = await fetch(flaskApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      logger.error('Failed to get a valid response from Flask API');
      return handleError(null, 'Failed to get a valid response from the model.', 502);
    }

    const data = await response.json();
    const predictedTests = data?.predicted_tests || [];
    const testByModelString = predictedTests.join(',');

    logger.info(`Predicted tests: ${testByModelString}`);

    const combinedData = {
      user_id: id,
      symptoms: symptomsString,
      test_by_model: testByModelString
    };

    // Insert the combined data into the database
    const queryString = 'INSERT INTO test_info (user_id, symptoms, test_by_model) VALUES (?, ?, ?)';
    const values = [combinedData.user_id, combinedData.symptoms, combinedData.test_by_model];
    logger.info('Inserting data into database');
    await query(queryString, values);

    logger.info('Data has been successfully saved.');
    return NextResponse.json({ message: 'Data has been successfully saved.' }, { status: 200 });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Invalid or expired token', { error });
      return handleError(error, 'Invalid or expired token', 401);
    }

    if (error instanceof SyntaxError) {
      logger.error('Invalid request body format', { error });
      return handleError(error, 'Invalid request body format', 400);
    }

    // Network errors or any other unexpected errors
    logger.error('Unexpected error occurred', { error });
    return handleError(error, 'An unexpected error occurred. Please try again later.', 500);
  }
}

// Helper function to catch errors for GET method
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

  if (!token) {
    logger.warn('No token provided');
    return handleError(null, 'You must be logged in to view this page.', 401);
  }

  try {
    logger.info('Verifying token');
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { id, role } = decodedToken;

    logger.info(`Token verified for user: ${id}, role: ${role}`);

    if (role !== 'patient') {
      logger.warn(`Unauthorized attempt by user with role: ${role}`);
      return handleError(null, 'You are not authorized to access this page.', 403);
    }

    logger.info(`Data fetched successfully for user: ${id}`);
    return NextResponse.json({ message: 'Data fetched successfully', id, role }, { status: 200 });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Invalid or expired token', { error });
      return handleError(error, 'Invalid or expired token', 401);
    }

    logger.error('Unexpected error occurred', { error });
    return handleError(error, 'An unexpected error occurred. Please try again later.', 500);
  }
}
