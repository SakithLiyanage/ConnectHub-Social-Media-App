import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { postsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image) {
      toast.error('Post cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const postData = {
        text,
        image
      };
      
      const res = await postsAPI.createPost(postData);
      
      setText('');
      setImage(null);
      setImagePreview(null);
      
      if (onPostCreated) {
        onPostCreated(res.data.data);
      }
      
      toast.success('Post created successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creating post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex space-x-4">
        <img
          src={
            user.profileImage
              ? `http://localhost:5000/uploads/profile/${user.profileImage}`
              : `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`
          }
          alt={user.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
              className="w-full border-0 focus:ring-0 resize-none text-sm rounded-lg p-3 bg-gray-50 min-h-[80px]"
            />
            
            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-60 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex">
                <label className="flex items-center cursor-pointer text-gray-500 hover:text-primary-500 mr-4">
                  <PhotoIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || (!text.trim() && !image)}
                className={`btn btn-primary px-4 py-1.5 text-sm ${
                  (!text.trim() && !image) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;