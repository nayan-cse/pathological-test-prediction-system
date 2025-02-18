import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export const query = async(sql, values = []) => {
    const [rows] = await pool.execute(sql, values);
    return rows;
};
