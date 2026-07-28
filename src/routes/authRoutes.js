// Maps auth-related URLs to their controller functions. No logic
// here — just wiring.

import express from 'express';
import { register, login } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// Temporary — proves roleCheck works. Remove once a real
// role-restricted route (Feature 4: create listing) exists.
router.get('/landlord-only-test', authMiddleware, roleCheck(['landlord']), (req, res) => {
  res.status(200).json({ success: true, message: 'You are a verified landlord route!' });
});

export default router;