// Sets up a single, reusable PostgreSQL connection pool for the whole app.

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Fires once when the pool successfully makes its first connection.
pool.on('connect', () => {
  console.log('PostgreSQL pool: connection established');
});

// Fires if a connection in the pool throws an unexpected error
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
  process.exit(1);
});

// A small helper so controllers/models never import `pg` directly —
// they just call query(text, params) and get rows back.
export const query = (text, params) => pool.query(text, params);
export { pool };