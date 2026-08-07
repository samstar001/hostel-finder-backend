// Mounted under /listings/:id/inspection-requests in app.js.

import express from 'express';
import {
  createInspectionRequest,
  getListingInspectionRequests,
  respondToInspectionRequest,
} from '../controllers/inspectionController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, roleCheck(['student']), createInspectionRequest);
router.get('/', authMiddleware, roleCheck(['landlord']), getListingInspectionRequests);
router.patch('/:requestId/respond', authMiddleware, roleCheck(['landlord']), respondToInspectionRequest);

export default router;