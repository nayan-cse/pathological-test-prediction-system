import { query } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import logger from "../../../../lib/logger";

export async function POST(req) {
    try {
        const body = await req.json();
        const { token, newPassword } = body;

        logger.info(`Password reset request received for token: ${token}`);

        const [user] = await query(
            "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?",
            [token, Date.now()]
        );
console.log(user)
        if (user.length === 0) {
            logger.warn(`Invalid or expired token used for password reset: ${token}`);
            return new Response(JSON.stringify({ message: "Invalid or expired token." }), { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await query(
            "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?",
            [hashedPassword, user.id]
        );

        logger.info(`Password successfully reset for user ID: ${user.id}`);

        return new Response(JSON.stringify({ message: "Password reset successful." }), { status: 200 });
    } catch (error) {
        logger.error(`Error processing password reset: ${error.message}`);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), { status: 500 });
    }
}
