import express from 'express';
import { signupUser, loginUser, logoutUser, getCurrentUser, searchReviewers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getCurrentUser);
router.get('/reviewers', protect, searchReviewers);

export default router;
