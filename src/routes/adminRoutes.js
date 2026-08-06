// All routes here require role: admin. Currently scoped to
// listing verification.

import express from 'express';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { getPendingListings, verifyListing, rejectListing, getReports, resolveReport } from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware, roleCheck(['admin']));

router.get('/listings/pending', getPendingListings);
router.patch('/listings/:id/verify', verifyListing);
router.patch('/listings/:id/reject', rejectListing);

router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

export default router;