import express from 'express';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCampaigns)
  .post(authorize('Editor'), createCampaign);

router.route('/:id')
  .put(authorize('Editor'), updateCampaign)
  .delete(authorize('Editor'), deleteCampaign);

export default router;
