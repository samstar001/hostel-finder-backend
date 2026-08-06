// Mounted under /listings/:id/reviews in app.js — nested under
// listings since a review always belongs to a specific listing.

import express from 'express';
import { createReview, getListingReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createReview);
router.get('/', getListingReviews);

export default router;