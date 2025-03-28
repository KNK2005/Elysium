import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
// Optional: Simple function to decode JWT if needed, or fetch user profile
// import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const Home = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tag, setTag] = useState('drug addiction');
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // State for Comments
    const [comments, setComments] = useState({}); // { postId: [comment1, comment2], ... }
    const [commentInput, setCommentInput] = useState({}); // { postId: "new comment text", ... }
    const [activeCommentSection, setActiveCommentSection] = useState(null); // postId or null
    const [commentLoading, setCommentLoading] = useState({}); // { postId: true/false }
    const [commentError, setCommentError] = useState({}); // { postId: "error message" }

    // State for Current User (to show delete button)
    const [currentUserId, setCurrentUserId] = useState(null);

    // --- User Fetch ---
    // Fetch current user ID when component mounts
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Option 1: Fetch from a profile endpoint
                    const { data } = await apiClient.get('/users/profile'); // Assuming you have this endpoint
                    setCurrentUserId(data._id);

                    // Option 2: Decode token (less secure if backend changes structure)
                    // const decoded = jwtDecode(token);
                    // setCurrentUserId(decoded.id); // Adjust 'id' based on your token payload
                } catch (err) {
                    console.error("Failed to fetch user profile:", err);
                    // Handle cases where token is invalid or expired if necessary
                    // localStorage.removeItem('token');
                }
            }
        };
        fetchCurrentUser();
    }, []);


    // --- Post Fetch & Create --- (Mostly unchanged)
    const fetchPosts = async () => {
        try {
            setError('');
            const { data } = await apiClient.get('/posts');
            setPosts(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []); // Sort newest first
        } catch (error) {
            console.error("Fetch Posts Error:", error);
            setError(error.response?.data?.message || 'Failed to fetch posts');
            setPosts([]);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            await apiClient.post('/posts', { title, content, tags: [tag] });
            setTitle('');
            setContent('');
            setTag('drug addiction');
            setSuccessMessage('Post created successfully!');
            fetchPosts(); // Refresh posts
        } catch (error) {
            console.error("Create Post Error:", error);
            setError(error.response?.data?.message || 'Failed to create post');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // --- Comment Functions ---

    const fetchCommentsForPost = async (postId) => {
        setCommentLoading(prev => ({ ...prev, [postId]: true }));
        setCommentError(prev => ({ ...prev, [postId]: null })); // Clear previous error
        try {
            const { data } = await apiClient.get(`/comments/${postId}`);
            setComments(prev => ({
                ...prev,
                [postId]: Array.isArray(data) ? data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : [] // Sort oldest first
            }));
        } catch (err) {
            console.error(`Fetch Comments Error for post ${postId}:`, err);
            setCommentError(prev => ({ ...prev, [postId]: err.response?.data?.message || 'Failed to load comments' }));
            setComments(prev => ({ ...prev, [postId]: [] })); // Ensure it's an empty array on error
        } finally {
            setCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleComments = (postId) => {
        const currentlyOpen = activeCommentSection === postId;
        setActiveCommentSection(currentlyOpen ? null : postId);

        // Fetch comments only if opening and they haven't been fetched yet
        if (!currentlyOpen && !comments[postId]) {
            fetchCommentsForPost(postId);
        }
    };

    const handleCommentInputChange = (postId, value) => {
        setCommentInput(prev => ({ ...prev, [postId]: value }));
    };

    const handleAddComment = async (e, postId) => {
        e.preventDefault();
        const content = commentInput[postId]?.trim();
        if (!content) return; // Don't submit empty comments

        setCommentLoading(prev => ({ ...prev, [`add-${postId}`]: true })); // Specific loading state for adding
        setCommentError(prev => ({ ...prev, [postId]: null }));

        try {
            await apiClient.post(`/comments/${postId}`, { content });
            setCommentInput(prev => ({ ...prev, [postId]: '' })); // Clear input
            fetchCommentsForPost(postId); // Refresh comments for this post
        } catch (err) {
            console.error(`Add Comment Error for post ${postId}:`, err);
            setCommentError(prev => ({ ...prev, [postId]: err.response?.data?.message || 'Failed to add comment' }));
        } finally {
             setCommentLoading(prev => ({ ...prev, [`add-${postId}`]: false }));
        }
    };

     const handleDeleteComment = async (commentId, postId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }
        // Consider adding a loading state specific to the comment being deleted
        setCommentError(prev => ({ ...prev, [postId]: null }));

        try {
            await apiClient.delete(`/comments/${commentId}`);
            fetchCommentsForPost(postId); // Refresh comments for the post
        } catch (err) {
             console.error(`Delete Comment Error ${commentId}:`, err);
             setCommentError(prev => ({ ...prev, [postId]: err.response?.data?.message || 'Failed to delete comment' }));
        } finally {
             // Clear specific comment loading state if implemented
        }
    };

    // --- Render ---
    return (
        <div className="home-container">
            <h2>Welcome to Elysium</h2>

            {error && <p className="error">Error: {error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}

            {/* Post Creation Form (Consider moving to its own component) */}
            <h3>Create a New Post</h3>
            <form onSubmit={handleCreatePost}>
                {/* Form fields... (same as before) */}
                <div>
                    <label htmlFor="titleInput">Title</label>
                    <input id="titleInput" type="text" placeholder="Enter post title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="contentInput">Content</label>
                    <textarea id="contentInput" placeholder="Share your thoughts..." value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="tagSelect">Tag</label>
                    <select id="tagSelect" value={tag} onChange={(e) => setTag(e.target.value)}>
                        <option value="drug addiction">Drug Addiction</option>
                        <option value="alcohol addiction">Alcohol Addiction</option>
                        <option value="rare diseases">Rare Diseases</option>
                    </select>
                </div>
                <button type="submit">Create Post</button>
            </form>

            {/* Display Recent Posts */}
            <h3>Recent Posts</h3>
            {posts.length === 0 ? (
                <p>No posts available. Create one above!</p>
            ) : (
                <div className="posts-list">
                    {posts.map((post) => (
                        <div key={post._id} className="post">
                            <h4>{post.title}</h4>
                            <p>{post.content}</p>
                             {/* Display Author */}
                            <p style={{ fontSize: '0.85rem', color: '#555' }}>
                                By: {post.user?.name || 'Unknown User'} on {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                            {/* Display Tags */}
                            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                                <span className="tag">Tag: {post.tags.join(', ')}</span>
                            )}

                            {/* Comments Toggle Button */}
                            <button
                                onClick={() => toggleComments(post._id)}
                                style={{ marginTop: '10px', marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', color: '#38bdf8', textDecoration: 'underline' }}
                            >
                                {activeCommentSection === post._id ? 'Hide' : 'Show'} Comments ({comments[post._id]?.length || 0})
                            </button>

                             {/* Optionally add Edit/Delete for the Post itself here if needed */}
                             {/* {currentUserId === post.user?._id && (
                                <>
                                    <button onClick={() => handleEditPost(post._id)}>Edit Post</button>
                                    <button onClick={() => handleDeletePost(post._id)}>Delete Post</button>
                                </>
                             )} */}


                            {/* Comment Section (Conditionally Rendered) */}
                            {activeCommentSection === post._id && (
                                <div className="comments-section" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <h5>Comments</h5>
                                    {commentLoading[post._id] && <p>Loading comments...</p>}
                                    {commentError[post._id] && <p className="error" style={{ color: 'red' }}>{commentError[post._id]}</p>}

                                    {/* Display Existing Comments */}
                                    {!commentLoading[post._id] && comments[post._id]?.length > 0 && (
                                        comments[post._id].map(comment => (
                                            <div key={comment._id} className="comment" style={{ marginBottom: '10px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px', background: '#f9f9f9' }}>
                                                <p style={{ margin: '0 0 5px 0' }}>{comment.content}</p>
                                                <small style={{ color: '#666' }}>
                                                    By: {comment.user?.name || 'User'} on {new Date(comment.createdAt).toLocaleDateString()}
                                                    {/* Delete Button - Show only if logged-in user owns the comment */}
                                                    {currentUserId === comment.user?._id && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id, post._id)}
                                                            style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize:'0.8em' }}
                                                            title="Delete comment"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </small>
                                            </div>
                                        ))
                                    )}
                                    {!commentLoading[post._id] && comments[post._id]?.length === 0 && <p>No comments yet.</p>}

                                    {/* Add Comment Form */}
                                    {currentUserId && ( // Only show add comment form if logged in
                                        <form onSubmit={(e) => handleAddComment(e, post._id)} style={{ marginTop: '15px' }}>
                                            <textarea
                                                placeholder="Add a comment..."
                                                value={commentInput[post._id] || ''}
                                                onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                                                required
                                                rows="2"
                                                style={{ width: '100%', boxSizing:'border-box', marginBottom: '5px', padding: '5px' }}
                                                disabled={commentLoading[`add-${post._id}`]} // Disable while adding
                                            />
                                            <button
                                                type="submit"
                                                disabled={!commentInput[post._id]?.trim() || commentLoading[`add-${post._id}`]} // Disable if empty or adding
                                            >
                                                {commentLoading[`add-${post._id}`] ? 'Adding...' : 'Add Comment'}
                                            </button>
                                        </form>
                                     )}
                                     {!currentUserId && <p><small>Please log in to add comments.</small></p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;