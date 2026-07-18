import express from 'express';
import { getBrands, getBrandById, createBrand, updateBrand, deleteBrand } from '../controllers/brandController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBrands)
  .post(authorize('Editor'), createBrand);

router.route('/:id')
  .get(getBrandById)
  .put(authorize('Editor'), updateBrand)
  .delete(authorize('Editor'), deleteBrand);

export default router;
