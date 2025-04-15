import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import PostList from '../Feed/PostList';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  const isOwnProfile = currentUser?._id === id;
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userData = await api.getUser(id);
        setProfileUser(userData);
        
        // Check if current user is following this profile
        if (currentUser && userData.followers) {
          setIsFollowing(userData.followers.includes(currentUser._id));
        }
        
        // Set initial form data if it's the user's own profile
        if (isOwnProfile) {
          setEditForm({
            name: userData.name || '',
            bio: userData.bio || '',
            profileImage: null
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id, currentUser, isOwnProfile, navigate]);
  
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.unfollowUser(id);
        setIsFollowing(false);
        setProfileUser(prev => ({
          ...prev,
          followers: prev.followers.filter(follower => follower !== currentUser._id)
        }));
      } else {
        await api.followUser(id);
        setIsFollowing(true);
        setProfileUser(prev => ({
          ...prev,
          followers: [...prev.followers, currentUser._id]
        }));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({
        ...editForm,
        profileImage: file
      });
      
      // Create preview for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);
      
      if (editForm.profileImage) {
        formData.append('profileImage', editForm.profileImage);
      }
      
      await updateProfile(formData);
      setIsEditing(false);
      
      // Refresh user data
      const updatedUserData = await api.getUser(id);
      setProfileUser(updatedUserData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!profileUser) {
    return <div>User not found</div>;
  }
  
  const profileImage = profileUser.profileImage?.startsWith('http') 
    ? profileUser.profileImage 
    : `http://localhost:5000/uploads/profile/${profileUser.profileImage}`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="mb-4 md:mb-0 md:mr-6">
            <img
              src={imagePreview || profileImage}
              alt={profileUser.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=User";
              }}
            />
          </div>
          
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="flex-1">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  className="textarea"
                  value={editForm.bio}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="profileImage">
                  Profile Image
                </label>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary-dark"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button 
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileUser.name}</h1>
              
              {profileUser.bio && (
                <p className="text-gray-600 mb-3">{profileUser.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start space-x-4 mb-4">
                <div className="text-center">
                  <span className="font-bold text-gray-900">{profileUser.posts?.length || 0}</span>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-gray-900">{profileUser.followers?.length || 0}</span>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-gray-900">{profileUser.following?.length || 0}</span>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
              </div>
              
              {isOwnProfile ? (
                <button 
                  className="btn-outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  className={isFollowing ? "btn-outline" : "btn-primary"}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* User's posts */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
        <PostList userId={id} />
      </div>
    </div>
  );
};

export default UserProfile;