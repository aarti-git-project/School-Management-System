import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface SignUpFormProps {
  isDarkMode: boolean;
  onSuccess: () => void;
}

export function SignUpForm({ isDarkMode, onSuccess }: SignUpFormProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState('parent');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    subjects: [] as string[],
    grade: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    // Reset role-specific fields when changing roles
    setFormData(prev => ({
      ...prev,
      subjects: [],
      grade: '',
      adminCode: ''
    }));
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
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (role === 'teacher' && formData.subjects.length === 0) {
      setError('Please select at least one subject');
      setIsLoading(false);
      return;
    }

    if (role === 'admin' && !formData.adminCode) {
      setError('Administrator code is required');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = role === 'teacher' 
        ? '/api/auth/teacher/signup'
        : role === 'admin'
        ? '/api/auth/admin/signup'
        : '/api/auth/signup';

      const response = await axios.post(`http://localhost:3000${endpoint}`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        ...(role === 'teacher' && { 
          subjects: formData.subjects,
          grade: formData.grade 
        }),
        ...(role === 'admin' && { 
          adminCode: formData.adminCode 
        })
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

  const getRoleIcon = () => {
    switch (role) {
      case 'teacher':
        return <School className={`w-10 h-10 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />;
      case 'admin':
        return <ShieldCheck className={`w-10 h-10 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />;
      default:
        return <Users className={`w-10 h-10 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-8">
        {getRoleIcon()}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Create Your Account
        </h1>
      </div>

      {role === 'admin' && (
        <div className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-violet-50'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
            <div>
              <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-900'}`}>
                Administrator Access
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-violet-800'}`}>
                Administrator registration requires a valid access code. Please contact your school's IT department if you need access.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-red-500 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className={labelClasses}>I am a</label>
          <select
            value={role}
            onChange={handleRoleChange}
            className={inputClasses}
          >
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

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

        {role === 'teacher' && (
          <>
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
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
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
              >
                <option value="">Select grade</option>
                {Array.from({ length: 6 }, (_, i) => (
                  <option key={i + 1} value={`Grade ${i + 1}`}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {role === 'admin' && (
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
        )}

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
          {isLoading ? 'Creating Account...' : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </button>

        <div className="text-center">
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