// A health check that confirms the Express server is up and responding.
//   2. Confirms the server can actually reach PostgreSQL — not just
//      that the pool was created, but that a real query succeeds.

import { query } from '../config/db.js';

export const checkHealth = async (req, res) => {
  try {
    const result = await query('SELECT NOW() AS current_time');

    res.status(200).json({
      success: true,
      message: 'API is running and database is connected',
      database_time: result.rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'API is running but database connection failed',
      error: err.message,
    });
  }
};