// Confirms the Express server is up AND that Prisma can actually
// reach the database — runs a real query, not just a connection check.

import { prisma } from '../config/prismaClient.js';

export const checkHealth = async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS current_time`;

    res.status(200).json({
      success: true,
      message: 'API is running and database is connected',
      database_time: result[0].current_time,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'API is running but database connection failed',
      error: err.message,
    });
  }
};