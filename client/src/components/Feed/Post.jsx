import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const Post = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post?.text || '');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const textareaRef = useRef(null);
  
  // Return null if post is undefined or doesn't have required properties
  if (!post || !post._id || !post.user) {
    console.warn('Invalid post data:', post);
    return null;
  }
  
  // Extract user data with defaults to avoid rendering errors
  const postUser = post.user || {};
  const userId = postUser._id || 'unknown';
  const userName = postUser.name || 'Unknown User';
  const profileImage = postUser.profileImage || '';
  const postDate = post.createdAt ? new Date(post.createdAt) : new Date();
  
  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.unlikePost(post._id);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await api.likePost(post._id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      await api.addComment(post._id, commentText);
      setCommentText('');
      onUpdate(); // Refresh posts to show the new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(post._id, commentId);
      onUpdate(); // Refresh posts after comment deletion
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.deletePost(post._id);
        toast.success('Post deleted successfully');
        onUpdate(); // Refresh posts after deletion
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };
  
  const startEditing = () => {
    setIsEditing(true);
    setEditedText(post.text || '');
    // Focus the textarea after it's rendered
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedText(post.text || '');
  };
  
  const saveEdit = async () => {
    if (!editedText.trim()) {
      toast.error('Post cannot be empty');
      return;
    }
    
    setIsSubmittingEdit(true);
    try {
      await api.updatePost(post._id, { text: editedText });
      setIsEditing(false);
      toast.success('Post updated successfully');
      onUpdate(); // Refresh posts to show the updated content
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <Link to={`/profile/${userId}`} className="flex items-center">
            <img
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
              src={(profileImage && typeof profileImage === 'string' && profileImage.startsWith('http')) 
                ? profileImage 
                : `http://localhost:5000/uploads/profile/${profileImage || 'default.png'}`}
              alt={userName}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=User";
              }}
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(postDate, { addSuffix: true })}
              </p>
            </div>
          </Link>
          
          {user?._id === userId && (
            <div className="relative flex space-x-2">
              <button 
                onClick={startEditing} 
                className="text-gray-500 hover:text-primary text-sm transition-colors"
                disabled={isEditing}
              >
                Edit
              </button>
              <button 
                onClick={handleDeletePost} 
                className="text-red-500 hover:text-red-700 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={textareaRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
              rows="3"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              disabled={isSubmittingEdit}
              placeholder="What's on your mind?"
            ></textarea>
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={cancelEditing}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmittingEdit}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                disabled={isSubmittingEdit || !editedText.trim()}
              >
                {isSubmittingEdit ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 my-2 whitespace-pre-line">{post.text || ''}</p>
        )}
        
        {post.image && (
          <div className="mt-3 -mx-4 -mb-4">
            <img
              src={`http://localhost:5000/uploads/posts/${post.image}`}
              alt="Post"
              className="w-full h-auto object-cover max-h-96"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
              }}
            />
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill={isLiked ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-gray-500 hover:text-primary transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <span>{post.comments?.length || 0} {(post.comments?.length || 0) === 1 ? 'comment' : 'comments'}</span>
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100">
          {/* Comment form */}
          <form onSubmit={handleCommentSubmit} className="flex mb-4">
            <input
              type="text"
              className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submittingComment}
            />
            <button 
              type="submit" 
              className={`ml-2 px-4 py-2 rounded-full text-sm font-medium ${
                submittingComment || !commentText.trim() 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              } transition-colors`}
              disabled={submittingComment || !commentText.trim()}
            >
              {submittingComment ? 'Posting...' : 'Post'}
            </button>
          </form>
          
          {/* Comments list */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex">
                  <Link to={`/profile/${comment.user}`} className="flex-shrink-0">
                    <img
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      src={comment.profileImage?.startsWith('http') 
                        ? comment.profileImage 
                        : `http://localhost:5000/uploads/profile/${comment.profileImage || 'default.png'}`}
                      alt={comment.name || 'User'}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=User";
                      }}
                    />
                  </Link>
                  <div className="ml-2 flex-grow">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{comment.name}</p>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{formatDistanceToNow(new Date(comment.date), { addSuffix: true })}</span>
                      {user?._id === comment.user && (
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-2">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;