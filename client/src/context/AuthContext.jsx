import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  
  // Add token to axios headers if it exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      if (token) {
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);
  
  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('/auth/register', userData);
      
      setToken(res.data.token);
      setUser(res.data.user);
      
      localStorage.setItem('token', res.data.token);
      
      toast.success('Registration successful!');
      navigate('/');
      
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('/auth/login', userData);
      
      setToken(res.data.token);
      setUser(res.data.user);
      
      localStorage.setItem('token', res.data.token);
      
      toast.success('Login successful!');
      
      // Redirect back to the page they tried to visit if any, or home
      const from = location.state?.from || '/';
      navigate(from);
      
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.info('You have been logged out');
  };
  
  // Update user profile
  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(res.data.data);
      toast.success('Profile updated successfully!');
      
      return res.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};