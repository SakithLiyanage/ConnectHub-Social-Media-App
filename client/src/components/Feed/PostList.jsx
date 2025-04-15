import React, { useState, useEffect } from 'react';
import Post from './Post';
import api from '../../utils/api';

const PostList = ({ userId = null, isFeed = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let fetchedPosts = [];
      
      if (userId) {
        // Fetch posts by a specific user
        const user = await api.getUser(userId);
        const allPosts = await api.getPosts();
        fetchedPosts = allPosts.filter(post => post.user && post.user._id === userId);
      } else if (isFeed) {
        // Fetch posts from users that the current user follows
        fetchedPosts = await api.getFeed();
      } else {
        // Fetch all posts
        fetchedPosts = await api.getPosts();
      }
      
      // Filter out any undefined or invalid posts
      const validPosts = fetchedPosts.filter(post => post && post._id);
      setPosts(validPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId, isFeed]);

  const handlePostUpdate = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts && posts.length > 0 ? (
        posts.map(post => (
          <Post key={post._id} post={post} onUpdate={handlePostUpdate} />
        ))
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {userId ? 'This user hasn\'t shared any posts yet.' : 'Start by creating a new post.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostList;