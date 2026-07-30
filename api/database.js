require("dotenv").config();
const { Pool } = require("pg");

let pool;

function getPool(){
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

module.exports = {
    query: (text, params) => getPool().query(text, params),
};