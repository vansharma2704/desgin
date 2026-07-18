import express from 'express';
import { getPrompts, createPrompt, updatePrompt, deletePrompt, generateImage } from '../controllers/promptController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate-image', authorize('Editor'), generateImage);

router.route('/')
  .get(getPrompts)
  .post(authorize('Editor'), createPrompt);

router.route('/:id')
  .put(updatePrompt)
  .delete(authorize('Editor'), deletePrompt);

export default router;
