import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';

// @desc Create a new post
// @route POST /api/posts
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content || !tags.length) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const post = new Post({
    user: req.user._id,
    title,
    content,
    tags,
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc Get all posts
// @route GET /api/posts
// @access Public
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate('user', 'name');
  res.json(posts);
});

// @desc Get posts by tag
// @route GET /api/posts/tag/:tag
// @access Public
const getPostsByTag = asyncHandler(async (req, res) => {
  const { tag } = req.params;

  if (!['drug addiction', 'alcohol addiction', 'rare diseases'].includes(tag)) {
    res.status(400);
    throw new Error('Invalid tag');
  }

  const posts = await Post.find({ tags: tag }).populate('user', 'name');
  res.json(posts);
});

// @desc Update a post
// @route PUT /api/posts/:id
// @access Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;
  post.tags = req.body.tags || post.tags;

  const updatedPost = await post.save();
  res.json(updatedPost);
});

// @desc Delete a post
// @route DELETE /api/posts/:id
// @access Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await post.deleteOne();
  res.json({ message: 'Post removed' });
});

export { createPost, getPosts, getPostsByTag, updatePost, deletePost };
