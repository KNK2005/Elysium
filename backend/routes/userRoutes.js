import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { getUserProfileById } from '../controllers/userController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { searchUsers } from '../controllers/userController.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserProfileById);

export default router;


