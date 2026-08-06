// All routes here require role: admin. Currently scoped to
// listing verification.

import express from 'express';
import { getPendingListings, verifyListing, rejectListing } from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.use(authMiddleware, roleCheck(['admin']));

router.get('/listings/pending', getPendingListings);
router.patch('/listings/:id/verify', verifyListing);
router.patch('/listings/:id/reject', rejectListing);

export default router;