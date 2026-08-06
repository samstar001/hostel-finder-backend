// src/routes/reportRoutes.js

import express from 'express';
import { createReport, uploadReportEvidence } from '../controllers/reportController.js';
import authMiddleware from '../middleware/auth.js';
import { upload } from '../config/cloudinaryUpload.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createReport);
router.post('/:reportId/evidence', authMiddleware, upload.array('evidence', 5), uploadReportEvidence);

export default router;