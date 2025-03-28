import express from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:postId', protect, addComment);
router.get('/:postId', getComments);
router.delete('/:commentId', protect, deleteComment);

export default router;
