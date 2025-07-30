import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';

interface LoginFormProps {
  isDarkMode: boolean;
}

export function LoginForm({ isDarkMode }: LoginFormProps) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('parent');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'userType') {
      setUserType(value.toLowerCase());
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await auth.login({
        ...formData,
        role: userType
      });
      
      navigate(`/dashboard/${response.user.role}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-red-500 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          I am a
        </label>
        <select
          name="userType"
          value={userType}
          onChange={handleChange}
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-violet-500`}
        >
          <option value="parent">Parent</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      <div>
        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="Enter your email"
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-violet-500`}
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Password
          </label>
          <a href="#" className="text-violet-600 hover:text-violet-500">
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          name="password"
          required
          placeholder="Enter your password"
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-violet-500`}
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors ${
          isLoading ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="text-center space-y-2">
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          {userType === 'admin' ? (
            <Link to="/signup/admin" className="text-violet-600 hover:text-violet-500">
              Sign Up as Administrator
            </Link>
          ) : userType === 'teacher' ? (
            <Link to="/signup/teacher" className="text-violet-600 hover:text-violet-500">
              Sign Up as Teacher
            </Link>
          ) : (
            <Link to="/signup" className="text-violet-600 hover:text-violet-500">
              Sign Up as Parent
            </Link>
          )}
        </p>
      </div>
    </form>
  );
}