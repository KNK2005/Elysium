import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  const fetchPostDetails = async () => {
    try {
      const postResponse = await apiClient.get(`/posts/${postId}`);
      const commentsResponse = await apiClient.get(`/comments/${postId}`);
      setPost(postResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch post details');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/comments/${postId}`, { content: commentText });
      setCommentText('');
      fetchPostDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      fetchPostDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  if (!post) return <p>Loading post...</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <span>Tag: {post.tag}</span>

      <h3>Comments</h3>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="comment">
            <p>{comment.content}</p>
            <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
          </div>
        ))
      )}

      <form onSubmit={handleAddComment}>
        <textarea
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        />
        <button type="submit">Add Comment</button>
      </form>

      {error && <p className="error">{error}</p>}
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default PostDetailPage;
