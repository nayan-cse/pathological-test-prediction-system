import { query } from "../../../../lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";
import logger from "../../../../lib/logger";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;

        logger.info(`Password reset request received for: ${email}`);

        const [user] = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (user.length === 0) {
            logger.warn(`Password reset failed: User not found (${email})`);
            return new Response(JSON.stringify({ message: "User not found." }), { status: 400 });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

        await query("UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?", [
            resetToken,
            resetTokenExpiry,
            email,
        ]);

        logger.info(`Password reset token generated for ${email}: ${resetToken}`);

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Hello,
        
        We received a request to reset the password for your account associated with ${email}. To reset your password, please click the link below:
        
        http://localhost:3000/reset-password?token=${resetToken}
        
        If you did not request a password reset, please disregard this email. Your password will remain unchanged. 
        
        For security purposes, this link will expire in 1 hour. After that, you will need to request a new password reset.
        
        
        Thank you,
        The Support Team`,
        };
        

        await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent successfully to: ${email}`);

        return new Response(JSON.stringify({ message: "Reset link sent to email." }), { status: 200 });

    } catch (error) {
        logger.error(`Error processing password reset for ${email}: ${error.message}`);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), { status: 500 });
    }
}
