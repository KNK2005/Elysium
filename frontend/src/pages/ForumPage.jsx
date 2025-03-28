import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const endpoint = selectedTag 
        ? `/posts/tag/${encodeURIComponent(selectedTag)}`
        : '/posts';
      const { data } = await apiClient.get(endpoint);
      setPosts(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch posts');
    }
  };

  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
  };

  const viewComments = (postId) => {
    navigate(`/posts/${postId}/comments`);
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  return (
    <div className="forum-container">
      <h2>Forum</h2>
      
      {error && <p className="error">{error}</p>}

      <label>Filter by Tag:</label>
      <select value={selectedTag} onChange={handleTagChange}>
        <option value="">All</option>
        <option value="Drug Addiction">Drug Addiction</option>
        <option value="Alcohol Addiction">Alcohol Addiction</option>
        <option value="Rare Diseases">Rare Diseases</option>
      </select>

      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="post">
            <p>{post.content}</p>
            <span>Tag: {post.tag}</span>
            <button onClick={() => viewComments(post._id)}>View Comments</button>
          </div>
        ))
      )}
    </div>
  );
};

export default ForumPage;
