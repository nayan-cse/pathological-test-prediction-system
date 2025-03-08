import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendEmail from '../../../../lib/sendEmail';

export async function POST(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, phone_number, city, specialty, designation, gender } = await req.json();
        if (!name || !email || !phone_number || !city || !specialty || !designation || !gender) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Generate a random password and hash it
        const generatedPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Insert user into database
        const result = await query(
            `INSERT INTO users (name, email, phone_number, password, role, city, specialty, designation, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone_number, hashedPassword, 'doctor', city, specialty, designation, gender]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
        }

        // Send confirmation email with login details
        const emailContent = `
            <h1>Account Registration Successful</h1>
            <p>Dear ${name},</p>
            <p>Your account has been created successfully. Here are your login details:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${generatedPassword}</p>
            <p>Please change your password after logging in.</p>
            <p>Best regards,<br/>Admin Team</p>
        `;
        await sendEmail(email, 'Account Confirmation', emailContent);

        return NextResponse.json({ message: 'User registered successfully, confirmation email sent' }, { status: 201 });
    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
