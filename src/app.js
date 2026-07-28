// Builds and configures the Express app itself. Deliberately does NOT
// call app.listen() — that lives in server.js. Keeping them separate
// means tests can import `app` and send fake requests to it without
// spinning up a real network port.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// --- Global middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
// Future feature routes get mounted here as they're built, e.g:
// app.use('/api/listings', listingRoutes);

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Centralized error handler (must be last) ---
app.use(errorHandler);

export default app;