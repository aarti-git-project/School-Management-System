import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { grades } from '../../lib/api';

interface GradesListProps {
  isDarkMode: boolean;
  children: Array<{
    id: string;
    fullName: string;
    grade: string;
  }>;
}

export function GradesList({ isDarkMode, children }: GradesListProps) {
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState<string>('all');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  const filteredGrades = selectedChild === 'all' 
    ? gradesList 
    : gradesList.filter(grade => grade.studentId._id === selectedChild);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Grades
        </h2>

        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className={`w-full md:w-auto p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Children</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.fullName}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {filteredGrades.map((grade) => (
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
                <span className="font-medium">Teacher Comments:</span> {grade.comments}
              </div>
            )}
            <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Teacher: {grade.teacherId.userId.fullName}
            </div>
          </div>
        ))}

        {filteredGrades.length === 0 && (
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No grades available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}