import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not defined');
    }
    
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }
    
    return pool;
}

export default pool;
