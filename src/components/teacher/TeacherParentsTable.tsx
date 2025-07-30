import React, { useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '../admin/DataTable';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

interface Parent {
  fullName: string;
  email: string;
  phone: string;
  children: Array<{
    name: string;
    grade: string;
    isClassTeacher: boolean;
    taughtSubjects: string[];
  }>;
}

interface TeacherParentsTableProps {
  isDarkMode: boolean;
}

export function TeacherParentsTable({ isDarkMode }: TeacherParentsTableProps) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const columnHelper = createColumnHelper<Parent>();

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/teacher/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setParents(response.data.parents);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('children', {
      header: 'Children',
      cell: info => (
        <div className="space-y-3">
          {info.getValue().map((child, idx) => (
            <div key={idx} className="space-y-1">
              <div className="font-medium">{child.name}</div>
              <div className="text-sm space-y-1">
                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {child.grade}
                </div>
                <div className="flex flex-wrap gap-2">
                  {child.isClassTeacher && (
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-400' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      Your Class Student
                    </span>
                  )}
                  {child.taughtSubjects.map((subject, sIdx) => (
                    <span
                      key={sIdx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDarkMode 
                          ? 'bg-blue-900/50 text-blue-400' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {subject} Student
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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

  return <DataTable data={parents} columns={columns} isDarkMode={isDarkMode} />;
}