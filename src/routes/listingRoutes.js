// Public routes: browsing listings needs no auth at all — students
// (and anyone else) should be able to search without an account.
// Protected routes: only landlords can create/update/delete, and
// only their own listings (enforced inside the controller).

import express from 'express';
import { upload } from '../config/cloudinaryUpload.js';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  uploadListingPhotos,
} from '../controllers/listingController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

// Public — no auth needed
router.get('/', getListings);
router.get('/:id', getListingById);

// Protected — landlord only
router.post('/', authMiddleware, roleCheck(['landlord']), createListing);
router.post('/:id/photos', authMiddleware, roleCheck(['landlord']), upload.array('photos', 5), uploadListingPhotos);
router.put('/:id', authMiddleware, roleCheck(['landlord']), updateListing);
router.delete('/:id', authMiddleware, roleCheck(['landlord']), deleteListing);

export default router;