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
  getDeletedListings,
  uploadPhotoCompound,
  uploadPhotoRoom,
  uploadPhotoKitchen,
  uploadPhotoBathroom,
  uploadPhotoToilet,
} from '../controllers/listingController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { upload } from '../config/cloudinaryUpload.js';

const router = express.Router();

// Public
router.get('/', getListings);
router.get('/deleted', authMiddleware, roleCheck(['landlord']), getDeletedListings); // must come before /:id
router.get('/:id', getListingById);

// Protected — landlord only
router.post('/', authMiddleware, roleCheck(['landlord']), createListing);
router.put('/:id', authMiddleware, roleCheck(['landlord']), updateListing);
router.delete('/:id', authMiddleware, roleCheck(['landlord']), deleteListing);

// Category-specific photo uploads
router.post('/:id/photos/compound', authMiddleware, roleCheck(['landlord']), upload.single('photo'), uploadPhotoCompound);
router.post('/:id/photos/room', authMiddleware, roleCheck(['landlord']), upload.single('photo'), uploadPhotoRoom);
router.post('/:id/photos/kitchen', authMiddleware, roleCheck(['landlord']), upload.single('photo'), uploadPhotoKitchen);
router.post('/:id/photos/bathroom', authMiddleware, roleCheck(['landlord']), upload.single('photo'), uploadPhotoBathroom);
router.post('/:id/photos/toilet', authMiddleware, roleCheck(['landlord']), upload.single('photo'), uploadPhotoToilet);

export default router;