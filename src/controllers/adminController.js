// Admin-only actions. Currently scoped to listing verification —
// approve or reject a pending listing. All routes here require
// role: admin, enforced via roleCheck middleware at the route level.

import { prisma } from '../config/prismaClient.js';

// View all listings currently awaiting review.
export const getPendingListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { verificationStatus: 'pending', isDeleted: false },
      include: { landlord: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }, // oldest first — first come, first reviewed
    });

    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve a listing — flips it from pending to verified.
export const verifyListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id: Number(id), isDeleted: false },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const updated = await prisma.listing.update({
      where: { id: Number(id) },
      data: { verificationStatus: 'verified' },
    });

    res.status(200).json({ success: true, message: 'Listing verified', listing: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject a listing — flips it from pending to rejected.
export const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id: Number(id), isDeleted: false },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const updated = await prisma.listing.update({
      where: { id: Number(id) },
      data: { verificationStatus: 'rejected' },
    });

    res.status(200).json({ success: true, message: 'Listing rejected', listing: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};