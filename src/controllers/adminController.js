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


// View all reports, most recent first. Includes reporter + listing
// info so an admin has enough context to act without extra lookups.
export const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, verificationStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark a report as reviewed or dismissed.
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "reviewed" or "dismissed"

    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be either "reviewed" or "dismissed"',
      });
    }

    const report = await prisma.report.findUnique({ where: { id: Number(id) } });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const updated = await prisma.report.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.status(200).json({ success: true, message: 'Report updated', report: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};