// Public routes: browsing listings needs no auth at all — students
// (and anyone else) should be able to search without an account.
// Protected routes: only landlords can create/update/delete, and
// only their own listings (enforced inside the controller).

import express from 'express';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

// Public — no auth needed
router.get('/', getListings);
router.get('/:id', getListingById);

// Protected — landlord only
router.post('/', authMiddleware, roleCheck(['landlord']), createListing);
router.put('/:id', authMiddleware, roleCheck(['landlord']), updateListing);
router.delete('/:id', authMiddleware, roleCheck(['landlord']), deleteListing);

export default router;