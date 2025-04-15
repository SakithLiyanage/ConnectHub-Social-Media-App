import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PostList from '../components/Feed/PostList';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'feed';
  
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user) return;
      
      setLoadingSuggestions(true);
      try {
        const users = await api.getUsers();
        // Filter out current user and users already being followed
        const filtered = users.filter(u => 
          u._id !== user._id && 
          !user.following?.includes(u._id)
        ).slice(0, 5);
        
        setSuggestedUsers(filtered);
      } catch (error) {
        console.error('Error fetching suggested users:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestedUsers();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should not exceed 5MB');
        return;
      }
      
      setPostImage(file);
      
      // Create preview for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!postText.trim() && !postImage) {
      toast.error('Post cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('text', postText);
      
      if (postImage) {
        formData.append('image', postImage);
      }
      
      await api.createPost(formData);
      
      // Reset form
      setPostText('');
      setPostImage(null);
      setImagePreview(null);
      
      // Refresh feed
      setRefreshFeed(prev => !prev);
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const users = await api.getUsers();
      const filtered = users.filter(u => 
        u._id !== user?._id && 
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      await api.followUser(userId);
      // Remove user from suggestions and search results
      setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
      setSearchResults(prev => prev.filter(user => user._id !== userId));
      
      toast.success('User followed successfully!');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

  if (!user) {
    return null; // Will redirect to login in useEffect
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              {/* User Profile Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="h-24 bg-gradient-to-r from-primary to-secondary"></div>
                <div className="px-6 pb-6 -mt-12">
                  <div className="flex justify-center">
                    <Link to={`/profile/${user._id}`}>
                      <img
                        src={user?.profileImage?.startsWith('http')
                          ? user.profileImage
                          : `http://localhost:5000/uploads/profile/${user?.profileImage || 'default.png'}`}
                        alt={user?.name}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=User";
                        }}
                      />
                    </Link>
                  </div>
                  <div className="text-center mt-3">
                    <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                    {user?.bio && (
                      <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
                    )}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{user?.posts?.length || 0}</p>
                      <p className="text-xs text-gray-500">Posts</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{user?.followers?.length || 0}</p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{user?.following?.length || 0}</p>
                      <p className="text-xs text-gray-500">Following</p>
                    </div>
                  </div>

                  <Link 
                    to={`/profile/${user._id}`}
                    className="mt-6 block w-full py-2 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm text-center transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 px-2">Quick Links</h3>
                  <div className="mt-2 space-y-1">
                    <Link 
                      to="/" 
                      className="flex items-center px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </Link>
                    <button 
                      onClick={() => setActiveTab('explore')}
                      className="w-full flex items-center px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Explore
                    </button>
                    <Link 
                      to={`/profile/${user._id}`}
                      className="flex items-center px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post Form */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
              <form onSubmit={handleSubmitPost}>
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.profileImage?.startsWith('http')
                        ? user.profileImage
                        : `http://localhost:5000/uploads/profile/${user?.profileImage || 'default.png'}`}
                      alt={user?.name}
                      className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=User";
                      }}
                    />
                    <textarea
                      className="flex-grow px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:outline-none focus:bg-white focus:border-primary resize-none transition-colors"
                      rows="2"
                      placeholder="What's on your mind?"
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <div className="rounded-xl overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Upload preview"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPostImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-80 transition-all"
                        aria-label="Remove image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <div className="flex space-x-1">
                    <label className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || (!postText.trim() && !postImage)}
                    className={`px-6 py-2 rounded-full font-medium text-sm ${
                      isSubmitting || (!postText.trim() && !postImage)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-md transition-all'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </div>
                    ) : (
                      'Share Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                    activeTab === 'feed' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Your Feed
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                    activeTab === 'explore' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Explore
                </button>
              </div>
            </div>
            
            {/* Search Bar - visible in explore tab */}
            {activeTab === 'explore' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!searchTerm.trim() || isSearching}
                      className={`ml-3 px-6 py-2 rounded-full font-medium text-sm ${
                        !searchTerm.trim() || isSearching
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark transition-colors'
                      }`}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </form>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 divide-y">
                      {searchResults.map(result => (
                        <div key={result._id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <Link to={`/profile/${result._id}`} className="flex-shrink-0">
                              <img
                                src={result.profileImage?.startsWith('http')
                                  ? result.profileImage
                                  : `http://localhost:5000/uploads/profile/${result.profileImage || 'default.png'}`}
                                alt={result.name}
                                className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/150?text=User";
                                }}
                              />
                            </Link>
                            <div className="ml-3">
                              <Link 
                                to={`/profile/${result._id}`}
                                className="font-medium text-gray-900 hover:text-primary transition-colors"
                              >
                                {result.name}
                              </Link>
                              <p className="text-xs text-gray-500">{result.email}</p>
                              {result.bio && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{result.bio}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleFollowUser(result._id)}
                            className="px-4 py-1.5 rounded-full border border-primary text-primary font-medium text-xs hover:bg-primary hover:text-white transition-colors"
                          >
                            Follow
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm && searchResults.length === 0 && !isSearching && (
                    <div className="mt-4 py-8 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-gray-500">No users found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Post List */}
            <PostList isFeed={activeTab === 'feed'} key={refreshFeed + activeTab} />
          </div>
          
          {/* Right sidebar - Suggested users */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-6">
              {/* Suggested People */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">People to Follow</h3>
                </div>
                
                <div className="p-4">
                  {loadingSuggestions ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : suggestedUsers.length > 0 ? (
                    <div className="space-y-4">
                      {suggestedUsers.map(suggestedUser => (
                        <div key={suggestedUser._id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Link to={`/profile/${suggestedUser._id}`} className="flex-shrink-0">
                              <img
                                src={suggestedUser.profileImage?.startsWith('http')
                                  ? suggestedUser.profileImage
                                  : `http://localhost:5000/uploads/profile/${suggestedUser.profileImage || 'default.png'}`}
                                alt={suggestedUser.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/150?text=User";
                                }}
                              />
                            </Link>
                            <div className="ml-3 max-w-[140px]">
                              <Link 
                                to={`/profile/${suggestedUser._id}`}
                                className="font-medium text-gray-900 hover:text-primary transition-colors truncate block"
                              >
                                {suggestedUser.name}
                              </Link>
                              {suggestedUser.bio && (
                                <p className="text-xs text-gray-500 truncate">{suggestedUser.bio}</p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleFollowUser(suggestedUser._id)}
                            className="p-2 rounded-full text-primary hover:bg-gray-50 transition-colors"
                            aria-label={`Follow ${suggestedUser.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        className="w-full text-center text-sm font-medium text-primary py-2 hover:underline transition-colors"
                        onClick={() => setActiveTab('explore')}
                      >
                        Show more
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="mt-2 text-gray-500 text-sm">No suggestions available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Trending Topics */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Trending Topics</h3>
                </div>
                
                <div className="p-4">
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-gray-900">#WebDevelopment</p>
                        <p className="text-xs text-gray-500 mt-1">1.2K posts</p>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-gray-900">#ReactJS</p>
                        <p className="text-xs text-gray-500 mt-1">865 posts</p>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-gray-900">#TailwindCSS</p>
                        <p className="text-xs text-gray-500 mt-1">452 posts</p>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Footer Links */}
              <div className="text-xs text-gray-500 px-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <a href="#" className="hover:underline">About</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Privacy</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Terms</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Help</a>
                </div>
                <p>© {new Date().getFullYear()} ConnectHub</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;