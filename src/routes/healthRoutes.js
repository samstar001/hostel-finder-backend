// Purely maps a URL to a controller function — no logic lives here.

import express from 'express';
import { checkHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/', checkHealth);

export default router;