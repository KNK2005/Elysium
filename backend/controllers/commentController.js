import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// @desc Add a comment to a post
// @route POST /api/comments/:postId
// @access Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await Comment.create({
    user: req.user._id,
    post: req.params.postId,
    content,
  });

  res.status(201).json(comment);
});

// @desc Get comments for a post
// @route GET /api/comments/:postId
// @access Public
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).populate('user', 'name');
  res.json(comments);
});

// @desc Delete a comment
// @route DELETE /api/comments/:commentId
// @access Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

export { addComment, getComments, deleteComment };
