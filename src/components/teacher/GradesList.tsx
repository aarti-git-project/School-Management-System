import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { grades } from '../../lib/api';
 
interface GradesListProps {
  isDarkMode: boolean;
  students: Array<{
    id: string;
    fullName: string;
    grade: string;
  }>;
}
 
// Define the available subjects as a constant
const SUBJECTS = [
  'Music',
  'Computer Science',
  'Mathematics',
  'Science',
  'Social Studies',
  'Art',
  'English',
  'Physical Education'
];
 
export function GradesList({ isDarkMode, students }: GradesListProps) {
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    testTitle: '',
    subject: '',
    grade: '',
    score: '',
    studentId: '',
    comments: ''
  });
 
  useEffect(() => {
    fetchGrades();
  }, []);
 
  const fetchGrades = async () => {
    try {
      const response = await grades.getAll();
      setGradesList(response.data.grades);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await grades.create({
        ...formData,
        score: Number(formData.score)
      });
      setShowAddForm(false);
      fetchGrades();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add grade');
    }
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Grades
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Add Grade
        </button>
      </div>
 
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
 
      {showAddForm && (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Student
              </label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.grade})
                  </option>
                ))}
              </select>
            </div>
 
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Test Title
              </label>
              <input
                type="text"
                required
                value={formData.testTitle}
                onChange={(e) => setFormData({ ...formData, testTitle: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
 
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Subject
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
 
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Grade
              </label>
              <input
                type="text"
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
 
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Score (0-100)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
 
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
 
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Add Grade
              </button>
            </div>
          </form>
        </div>
      )}
 
      <div className="grid gap-6">
        {gradesList.map((grade) => (
          <div
            key={grade._id}
            className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {grade.testTitle}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {grade.subject} • {grade.studentId.fullName}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                grade.score >= 90 ? 'bg-green-100 text-green-800' :
                grade.score >= 80 ? 'bg-blue-100 text-blue-800' :
                grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Score: {grade.score}%
              </div>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Grade: {grade.grade}
            </div>
            {grade.comments && (
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {grade.comments}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}