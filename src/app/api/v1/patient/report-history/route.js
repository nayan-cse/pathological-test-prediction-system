export async function GET(req) {
    // Check for token in Authorization header or cookies
    const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('accessToken');

    if (!token) {
        logger.warn('Access denied: User is not logged in');
        return NextResponse.json({ error: 'You must be logged in to view this page.' }, { status: 401 });
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const { id, role } = decodedToken;
        logger.info(`Decoded Token: ID = ${id}, Role = ${role}`);

        if (role !== 'patient') {
            logger.warn(`Access denied: User with role ${role} tried to access this resource`);
            return NextResponse.json({ error: 'You are not authorized to access this page.' }, { status: 403 });
        }

        // Respond with patient-specific data or a message
        return NextResponse.json({ message: 'Data fetched successfully', id, role }, { status: 200 });

    } catch (error) {
        logger.error(`Error verifying token: ${error.message}`);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
