import express from 'express';
import { analyzeStyle, generateDesignPipeline } from '../controllers/StyleMemoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/analyze-style', authorize('Editor'), analyzeStyle);
router.post('/generate', authorize('Editor'), generateDesignPipeline);

export default router;
