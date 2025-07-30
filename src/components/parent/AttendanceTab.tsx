import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { attendance } from '../../lib/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Child {
  id: string;
  fullName: string;
  grade: string;
}

interface AttendanceTabProps {
  isDarkMode: boolean;
  children: Child[];
}

export function AttendanceTab({ isDarkMode, children }: AttendanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [attendanceData, setAttendanceData] = useState<any>(null);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children]);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceReport();
    }
  }, [selectedChild, selectedMonth]);

  const fetchAttendanceReport = async () => {
    try {
      const startDate = startOfMonth(new Date(selectedMonth));
      const endDate = endOfMonth(new Date(selectedMonth));

      const response = await attendance.getStudentReport(selectedChild, {
        startDate,
        endDate
      });

      setAttendanceData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800';
      case 'absent':
        return isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800';
      case 'late':
        return isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
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
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Attendance Report
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your child's attendance records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className={`p-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.fullName}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`p-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {attendanceData && (
        <div className="grid gap-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Days
              </h3>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {attendanceData.statistics.total}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} shadow-lg`}>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                Present
              </h3>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                {attendanceData.statistics.present}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} shadow-lg`}>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                Absent
              </h3>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                {attendanceData.statistics.absent}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} shadow-lg`}>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                Late
              </h3>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                {attendanceData.statistics.late}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} shadow-lg`}>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                Excused
              </h3>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                {attendanceData.statistics.excused}
              </p>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Attendance Rate
              </h3>
              <div className={`px-4 py-2 rounded-lg ${
                attendanceData.statistics.attendanceRate >= 90
                  ? isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                  : attendanceData.statistics.attendanceRate >= 80
                  ? isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                  : isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
              }`}>
                {attendanceData.statistics.attendanceRate}%
              </div>
            </div>
          </div>

          {/* Detailed Records */}
          <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Notes</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {attendanceData.records.map((record: any) => (
                    <tr key={record._id} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <td className="p-4">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}