import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { sendMessage, getMessages, getRecentChats } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/', protect, getRecentChats);
router.get('/:userId', protect, getMessages);

export default router;
