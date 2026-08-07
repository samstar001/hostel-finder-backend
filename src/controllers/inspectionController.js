// Students request to inspect a listing on a proposed date. Landlords
// accept or decline requests on their own listings. Both sides can
// view requests relevant to them — students see their own requests
// across all listings, landlords see requests on listings they own.

import { prisma } from '../config/prismaClient.js';

// Student creates an inspection request on a listing.
export const createInspectionRequest = async (req, res) => {
  try {
    const { id } = req.params; // listing id
    const { requestedDate, message } = req.body;

    if (!requestedDate) {
      return res.status(400).json({ success: false, message: 'requestedDate is required' });
    }

    const parsedDate = new Date(requestedDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'requestedDate is not a valid date' });
    }

    if (parsedDate < new Date()) {
      return res.status(400).json({ success: false, message: 'requestedDate cannot be in the past' });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: Number(id), isDeleted: false },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const request = await prisma.inspectionRequest.create({
      data: {
        listingId: Number(id),
        studentId: req.user.id,
        requestedDate: parsedDate,
        message,
      },
    });

    res.status(201).json({ success: true, message: 'Inspection request submitted', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Student views their own inspection requests, across all listings.
export const getMyInspectionRequests = async (req, res) => {
  try {
    const requests = await prisma.inspectionRequest.findMany({
      where: { studentId: req.user.id },
      include: { listing: { select: { id: true, title: true, location: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Landlord views inspection requests made on listings they own.
export const getListingInspectionRequests = async (req, res) => {
  try {
    const { id } = req.params; // listing id

    const listing = await prisma.listing.findUnique({ where: { id: Number(id) } });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.landlordId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view requests on your own listings',
      });
    }

    const requests = await prisma.inspectionRequest.findMany({
      where: { listingId: Number(id) },
      include: { student: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { requestedDate: 'asc' },
    });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Landlord accepts or declines a specific request.
export const respondToInspectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // "accepted" or "declined"

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be either "accepted" or "declined"',
      });
    }

    const request = await prisma.inspectionRequest.findUnique({
      where: { id: Number(requestId) },
      include: { listing: true },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Inspection request not found' });
    }

    if (request.listing.landlordId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to requests on your own listings',
      });
    }

    const updated = await prisma.inspectionRequest.update({
      where: { id: Number(requestId) },
      data: { status },
    });

    res.status(200).json({ success: true, message: `Request ${status}`, request: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};