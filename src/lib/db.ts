import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * PostgreSQL Pool авах.
 * DATABASE_URL байхгүй бол null буцаана (throw хийхгүй).
 */
export function getPool(): Pool | null {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ DATABASE_URL тохируулаагүй байна — DB холболт алгасав');
        return null;
    }
    
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL.includes('render.com')
                ? { rejectUnauthorized: false }
                : undefined,
        });
    }
    
    return pool;
}

export default pool;
