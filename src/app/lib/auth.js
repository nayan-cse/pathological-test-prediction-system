import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req) => {
    const authorizationHeader = req.headers.get('Authorization');

    if (!authorizationHeader) {
        return NextResponse.json({ error: 'Authorization token required.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Token is missing in the Authorization header.' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }
};
