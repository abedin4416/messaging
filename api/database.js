import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

let pool;

async function getPool(){
    if(!pool){
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: true,
            },
            max: 1,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return pool;
}

export default {
    query: async (text, params) => {
        const client = await getPool();
        return client.query(text, params);
    },
};