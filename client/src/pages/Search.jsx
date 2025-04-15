import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/common/Button';

const UserSearch = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    // Extract search query from URL if present
    const query = new URLSearchParams(location.search).get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [location.search]);

  const handleSearch = async (query = searchTerm) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const users = await api.getUsers();
      // Filter users by name or email containing the search term
      const filteredUsers = users.filter(u => 
        u._id !== user._id && // Exclude current user
        (u.name.toLowerCase().includes(query.toLowerCase()) || 
         u.email.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(filteredUsers);
      
      // Initialize following status for each user
      const statusMap = {};
      filteredUsers.forEach(u => {
        statusMap[u._id] = user.following?.includes(u._id) || false;
      });
      setFollowingStatus(statusMap);
      
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      if (followingStatus[userId]) {
        await api.unfollowUser(userId);
      } else {
        await api.followUser(userId);
      }
      
      // Update following status
      setFollowingStatus({
        ...followingStatus,
        [userId]: !followingStatus[userId]
      });
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find People</h1>
      
      {/* Search form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex"
        >
          <input
            type="text"
            className="input flex-grow mr-2"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" isLoading={loading}>
            Search
          </Button>
        </form>
      </div>
      
      {/* Search results */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {searchResults.map(user => (
              <li key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <Link to={`/profile/${user._id}`} className="flex items-center flex-grow">
                    <img
                      className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      src={user.profileImage?.startsWith('http') 
                        ? user.profileImage 
                        : `http://localhost:5000/uploads/profile/${user.profileImage}`}
                      alt={user.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=User";
                      }}
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.bio || "No bio available"}</p>
                    </div>
                  </Link>
                  <Button
                    variant={followingStatus[user._id] ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handleFollowToggle(user._id)}
                  >
                    {followingStatus[user._id] ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : searchTerm ? (
          <div className="py-12 text-center">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              We couldn't find any users matching "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className="py-12 text-center">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Search for users</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter a name or email to find people to follow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;