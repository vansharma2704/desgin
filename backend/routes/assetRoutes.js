import express from 'express';
import { getAssets, createAsset, deleteAsset } from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAssets)
  .post(createAsset);

router.route('/:id')
  .delete(deleteAsset);

export default router;
