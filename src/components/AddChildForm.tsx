import React, { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { parent } from '../lib/api';

interface AddChildFormProps {
  isDarkMode: boolean;
  onSuccess: () => void;
}

export function AddChildForm({ isDarkMode, onSuccess }: AddChildFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    grade: '',
    subjects: [] as string[]
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubjectChange = (subject: string) => {
    const updatedSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];

    if (updatedSubjects.length <= 4) {
      setFormData({ ...formData, subjects: updatedSubjects });
      setError('');
    } else {
      setError('Please select exactly 4 subjects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.subjects.length !== 4) {
      setError('Please select exactly 4 subjects');
      setIsLoading(false);
      return;
    }

    try {
      await parent.addChild(formData);
      setSuccess('Child added successfully!');
      setFormData({
        fullName: '',
        age: '',
        grade: '',
        subjects: []
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add child');
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <PlusCircle className={`w-8 h-8 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Add New Child
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClasses}>Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            placeholder="Enter child's full name"
            className={inputClasses}
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Age</label>
          <input
            type="number"
            name="age"
            required
            min="4"
            max="12"
            placeholder="Enter child's age"
            className={inputClasses}
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Grade</label>
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

        <div>
          <label className={labelClasses}>
            Select 4 Subjects
            <span className="text-sm ml-2 text-gray-500">
              ({formData.subjects.length}/4 selected)
            </span>
          </label>
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

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Adding Child...' : 'Add Child'}
        </button>
      </form>
    </div>
  );
}