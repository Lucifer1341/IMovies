import express from 'express';
import { createHold, getHold, releaseHold } from '../controllers/holdController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createHold);
router.get('/:holdId', authenticate, getHold);
router.delete('/:holdId', authenticate, releaseHold);

export default router;
