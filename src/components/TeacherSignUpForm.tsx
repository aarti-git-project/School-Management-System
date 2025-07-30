import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, AlertCircle } from 'lucide-react';
import { auth } from '../lib/api';

interface TeacherSignUpFormProps {
  isDarkMode: boolean;
  onSuccess: () => void;
}

export function TeacherSignUpForm({ isDarkMode, onSuccess }: TeacherSignUpFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subjects: [] as string[],
    grade: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableSubjects = [
    'Mathematics',
    'English',
    'Science',
    'Social Studies',
    'Art',
    'Music',
    'Physical Education',
    'Computer Science'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      setIsLoading(false);
      return;
    }

    try {
      const response = await auth.signup({
        ...formData,
        role: 'teacher'
      });

      setSuccess('Your account has been created successfully and is pending admin approval. You will be redirected to the login page in a few seconds.');
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subjects: [],
        grade: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 5000);

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
        <School className={`w-10 h-10 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Elementary Teacher Registration
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
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
            disabled={isLoading || !!success}
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
            disabled={isLoading || !!success}
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
            disabled={isLoading || !!success}
          />
        </div>

        <div>
          <label className={labelClasses}>Subjects You Teach</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {availableSubjects.map(subject => (
              <label
                key={subject}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.subjects.includes(subject)
                    ? 'bg-violet-100 border-violet-500 text-violet-900'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                } ${(isLoading || !!success) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.subjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                  disabled={isLoading || !!success}
                />
                <span className="ml-2">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClasses}>Grade Level</label>
          <select
            name="grade"
            required
            className={inputClasses}
            value={formData.grade}
            onChange={handleChange}
            disabled={isLoading || !!success}
          >
            <option value="">Select grade</option>
            {Array.from({ length: 6 }, (_, i) => (
              <option key={i + 1} value={`Grade ${i + 1}`}>
                Grade {i + 1}
              </option>
            ))}
          </select>
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
            disabled={isLoading || !!success}
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
            disabled={isLoading || !!success}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!success}
          className={`w-full py-3 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors ${
            (isLoading || !!success) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Creating Account...' : 'Create Teacher Account'}
        </button>

        <div className="text-center space-y-2">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/" className="text-violet-600 hover:text-violet-500">
              Sign In
            </Link>
          </p>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you a parent?{' '}
            <Link to="/signup" className="text-violet-600 hover:text-violet-500">
              Sign up as Parent
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}