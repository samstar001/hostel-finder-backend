import express from 'express';
import {
  registerInitiate,
  registerVerifyOtp,
  registerComplete,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register/initiate', registerInitiate);
router.post('/register/verify-otp', registerVerifyOtp);
router.post('/register/complete', registerComplete);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

export default router;