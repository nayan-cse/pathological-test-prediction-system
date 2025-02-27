import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import { NextResponse } from 'next/server';
import logger from '../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    const { name, email, phone_number, password, role, date_of_birth, gender } = await req.json();

    // Validate required fields
    if (!name || !email || !phone_number || !password || !date_of_birth || !gender) {
        logger.error('Registration failed: Missing required fields');
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    try {
        // Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            logger.warn(`Registration failed: User with email ${email} already exists`);
            return NextResponse.json({ error: 'User already exists.' }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        const result = await query(
            'INSERT INTO users (name, email, phone_number, password, role, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone_number, hashedPassword, role, date_of_birth, gender]
        );

        // Generate JWT Token
        const token = jwt.sign({ id: result.insertId, email, name, role, gender }, JWT_SECRET, { expiresIn: '1h' });
        logger.info(`${name} with email ${email} registered successfully`);

        return NextResponse.json({ token, message: 'User registered successfully!' }, { status: 201 });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
