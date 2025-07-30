import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface AdminSignUpFormProps {
  isDarkMode: boolean;
  onSuccess: () => void;
}

export function AdminSignUpForm({ isDarkMode, onSuccess }: AdminSignUpFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    adminCode: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.adminCode.trim()) {
      setError('Administrator code is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/admin/signup', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        adminCode: formData.adminCode,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      onSuccess();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = `w-full p-3 rounded-lg border ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-violet-500`;

  const labelClasses = `block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-8">
        <ShieldCheck className={`w-10 h-10 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Administrator Registration
        </h1>
      </div>

      <div className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-violet-50'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
          <div>
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-900'}`}>
              Administrator Access
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-violet-800'}`}>
              This registration is for school administrators only. You'll need a valid administrator code to create an account. 
              Please contact your school's IT department if you need access.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-red-500 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className={labelClasses}>Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            placeholder="Enter your full name"
            className={inputClasses}
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className={inputClasses}
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="Enter your phone number"
            className={inputClasses}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Administrator Code</label>
          <input
            type="text"
            name="adminCode"
            required
            placeholder="Enter administrator code"
            className={inputClasses}
            value={formData.adminCode}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="Create a password"
            className={inputClasses}
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirm your password"
            className={inputClasses}
            value={formData.confirmPassword}
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
          {isLoading ? 'Creating Account...' : 'Create Administrator Account'}
        </button>

        <div className="text-center space-y-2">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/" className="text-violet-600 hover:text-violet-500">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}