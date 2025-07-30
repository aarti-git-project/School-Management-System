import React, { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { assignments } from '../../lib/api';

interface AssignmentFormProps {
  isDarkMode: boolean;
  onSuccess: () => void;
}

export function AssignmentForm({ isDarkMode, onSuccess }: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await assignments.create(formData);
      setSuccess('Assignment created successfully!');
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        dueDate: ''
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment');
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
          Create New Assignment
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
          <label className={labelClasses}>Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="Enter assignment title"
            className={inputClasses}
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            name="description"
            required
            placeholder="Enter assignment description"
            className={inputClasses}
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <label className={labelClasses}>Subject</label>
          <select
            name="subject"
            required
            className={inputClasses}
            value={formData.subject}
            onChange={handleChange}
          >
            <option value="">Select subject</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Art">Art</option>
            <option value="Music">Music</option>
            <option value="Physical Education">Physical Education</option>
            <option value="Computer Science">Computer Science</option>
          </select>
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
          <label className={labelClasses}>Due Date</label>
          <input
            type="datetime-local"
            name="dueDate"
            required
            className={inputClasses}
            value={formData.dueDate}
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
          {isLoading ? 'Creating Assignment...' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
}