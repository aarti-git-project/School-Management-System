import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface StudentsListProps {
  isDarkMode: boolean;
}

interface Student {
  fullName: string;
  age: number;
  grade: string;
  subjects: string[];
  parentName: string;
}

export function StudentsList({ isDarkMode }: StudentsListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStudents(response.data.students);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const SubjectTag = ({ subject }: { subject: string }) => (
    <span className={`px-3 py-1 rounded-full text-sm ${
      isDarkMode 
        ? 'bg-gray-700 text-gray-200' 
        : 'bg-blue-100 text-blue-700'
    }`}>
      {subject}
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Students
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and monitor all students
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
          <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'}`} />
        </div>
      </div>

      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="p-4">Name</th>
                <th className="p-4">Age</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Subjects</th>
                <th className="p-4">Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student, index) => (
                <tr key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <td className="p-4">{student.fullName}</td>
                  <td className="p-4">{student.age} years</td>
                  <td className="p-4">{student.grade}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {student.subjects.map((subject, idx) => (
                        <SubjectTag key={idx} subject={subject} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">{student.parentName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}