import React, { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface ParentsListProps {
  isDarkMode: boolean;
}

interface Parent {
  fullName: string;
  email: string;
  phone: string;
  status: string;
  childCount: number;
}

export function ParentsList({ isDarkMode }: ParentsListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
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

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm capitalize ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

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
            Parents
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and monitor all parents
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
          <Users className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'}`} />
        </div>
      </div>

      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Children</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {parents.map((parent, index) => (
                <tr key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <td className="p-4">{parent.fullName}</td>
                  <td className="p-4">{parent.email}</td>
                  <td className="p-4">{parent.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {parent.childCount} children
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={parent.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}