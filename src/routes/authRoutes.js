import express from 'express';
import { upload } from '../config/cloudinaryUpload.js';
import authMiddleware from '../middleware/auth.js';
import { getMyInspectionRequests } from '../controllers/inspectionController.js';
import {
  registerInitiate,
  registerVerifyOtp,
  registerComplete,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  uploadProfilePicture,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register/initiate', registerInitiate);
router.post('/register/verify-otp', registerVerifyOtp);
router.post('/register/complete', registerComplete);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);
router.get('/my-inspection-requests', authMiddleware, getMyInspectionRequests);

export default router;