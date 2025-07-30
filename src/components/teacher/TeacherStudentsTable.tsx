import React, { useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '../admin/DataTable';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

interface Student {
  fullName: string;
  age: number;
  grade: string;
  subjects: string[];
  parentName: string;
  parentEmail: string;
  teacherRole: {
    isClassTeacher: boolean;
    subjectTeacher: string[];
  };
}

interface TeacherStudentsTableProps {
  isDarkMode: boolean;
}

export function TeacherStudentsTable({ isDarkMode }: TeacherStudentsTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const columnHelper = createColumnHelper<Student>();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/teacher/users', {
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

  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('age', {
      header: 'Age',
      cell: info => `${info.getValue()} years`,
    }),
    columnHelper.accessor('grade', {
      header: 'Grade',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('teacherRole', {
      header: 'Your Role',
      cell: info => {
        const role = info.getValue();
        return (
          <div className="space-y-1">
            {role.isClassTeacher && (
              <span className={`px-3 py-1 rounded-full text-sm ${
                isDarkMode 
                  ? 'bg-green-900/50 text-green-400' 
                  : 'bg-green-100 text-green-700'
              }`}>
                Class Teacher
              </span>
            )}
            {role.subjectTeacher.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {role.subjectTeacher.map((subject, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDarkMode 
                        ? 'bg-blue-900/50 text-blue-400' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {subject} Teacher
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('subjects', {
      header: 'All Subjects',
      cell: info => (
        <div className="flex flex-wrap gap-2">
          {info.getValue().map((subject, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200' 
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {subject}
            </span>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor(row => ({ name: row.parentName, email: row.parentEmail }), {
      id: 'parent',
      header: 'Parent',
      cell: info => (
        <div>
          <div>{info.getValue().name}</div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {info.getValue().email}
          </div>
        </div>
      ),
    }),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
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

  return <DataTable data={students} columns={columns} isDarkMode={isDarkMode} />;
}