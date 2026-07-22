import express from 'express';
import { getDesigns, getDesignById, createDesign, updateDesign, deleteDesign, migrateDraftsToCompleted, claimMyDesigns } from '../controllers/designController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// One-time migration — no auth required
router.post('/migrate-drafts', migrateDraftsToCompleted);

router.use(protect);

// Claim designs (backfill createdBy for existing designs)
router.post('/claim-mine', claimMyDesigns);

router.route('/')
  .get(getDesigns)
  .post(createDesign);

router.route('/:id')
  .get(getDesignById)
  .put(updateDesign)
  .delete(deleteDesign);

export default router;

