import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Users } from 'lucide-react';
import { attendance } from '../../lib/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceTabProps {
  isDarkMode: boolean;
}

export function AttendanceTab({ isDarkMode }: AttendanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [attendanceData, setAttendanceData] = useState<any>(null);

  useEffect(() => {
    fetchAttendanceReport();
  }, [selectedGrade, selectedMonth]);

  const fetchAttendanceReport = async () => {
    try {
      const startDate = startOfMonth(new Date(selectedMonth));
      const endDate = endOfMonth(new Date(selectedMonth));

      const response = await attendance.getClassReport(selectedGrade, {
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
            Class Attendance Report
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor attendance across all grades
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className={`p-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <option key={i + 1} value={`Grade ${i + 1}`}>
                Grade {i + 1}
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
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <Users className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Total Students
                </h3>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {attendanceData.totalStudents}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Average Attendance Rate
                </h3>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {attendanceData.statistics.attendanceRate}%
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Absences This Month
                </h3>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {attendanceData.statistics.absent}
              </p>
            </div>
          </div>

          {/* Student Statistics */}
          <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Student Attendance Statistics
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className="p-4">Student</th>
                    <th className="p-4">Present</th>
                    <th className="p-4">Absent</th>
                    <th className="p-4">Late</th>
                    <th className="p-4">Excused</th>
                    <th className="p-4">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {attendanceData.studentStats.map((stat: any) => (
                    <tr key={stat.student.id} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <td className="p-4">{stat.student.fullName}</td>
                      <td className="p-4">{stat.present}</td>
                      <td className="p-4">{stat.absent}</td>
                      <td className="p-4">{stat.late}</td>
                      <td className="p-4">{stat.excused}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full ${
                          stat.attendanceRate >= 90
                            ? isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                            : stat.attendanceRate >= 80
                            ? isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                            : isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
                        }`}>
                          {stat.attendanceRate}%
                        </span>
                
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