// src/controllers/reportController.js
//
// Any authenticated user can flag a listing as suspicious, with a
// category, description, and optional evidence files uploaded
// separately after the report is created.

import { prisma } from '../config/prismaClient.js';

const VALID_CATEGORIES = [
  'suspicious_listing',
  'fake_photos',
  'scam_fraud',
  'inappropriate_behaviour',
  'fake_contact_info',
  'impersonation',
  'other',
];

// Submit a report on a listing.
export const createReport = async (req, res) => {
  try {
    const { id } = req.params; // listing id
    const { category, description } = req.body;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    if (!description) {
      return res.status(400).json({ success: false, message: 'description is required' });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: Number(id), isDeleted: false },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const report = await prisma.report.create({
      data: {
        listingId: Number(id),
        reporterId: req.user.id,
        category,
        description,
      },
    });

    res.status(201).json({ success: true, message: 'Report submitted', report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload evidence file(s) to an existing report. Reporter-only —
// only the person who filed the report can attach evidence to it.
export const uploadReportEvidence = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.report.findUnique({ where: { id: Number(reportId) } });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.reporterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only add evidence to your own report',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const newEvidenceUrls = req.files.map((file) => file.path);

    const updated = await prisma.report.update({
      where: { id: Number(reportId) },
      data: { evidence: [...report.evidence, ...newEvidenceUrls] },
    });

    res.status(200).json({ success: true, message: 'Evidence uploaded', report: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};