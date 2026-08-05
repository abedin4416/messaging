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

async function insert(table, data) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) {
      throw new Error("No data provided for insertion.");
    }

    const columns = keys.join(", ");
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

    const query = `
      INSERT INTO ${table} (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;
    const poolInstance = await getPool();
    const result = await poolInstance.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error(`Database insertion into table "${table}" failed:`, err);
    throw err;
  }
}


export default {
    query: async (text, params) => {
        const client = await getPool();
        return client.query(text, params);
    },
    insert,
};