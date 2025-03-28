import express from 'express';
import {
  createPost,
  getPosts,
  getPostsByTag,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createPost).get(getPosts);
router.route('/tag/:tag').get(getPostsByTag);
router.route('/:id').put(protect, updatePost).delete(protect, deletePost);
router.get('/', getPosts);

export default router;

