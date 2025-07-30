import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Check, X, AlertTriangle } from 'lucide-react';
import { attendance } from '../../lib/api';
import { format } from 'date-fns';

interface Student {
  id: string;
  fullName: string;
  grade: string;
}

interface AttendanceTabProps {
  isDarkMode: boolean;
  students: Student[];
}

export function AttendanceTab({ isDarkMode, students }: AttendanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const response = await attendance.getAttendance({
        startDate: new Date(selectedDate),
        endDate: new Date(selectedDate)
      });
      setAttendanceRecords(response.data.attendance);
      
      // Pre-fill attendance data from records
      const data: {[key: string]: string} = {};
      response.data.attendance.forEach((record: any) => {
        data[record.studentId._id] = record.status;
      });
      setAttendanceData(data);
      
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: string) => {
    try {
      await attendance.markAttendance({
        studentId,
        date: new Date(selectedDate),
        status: status as 'present' | 'absent' | 'late' | 'excused'
      });
      
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: status
      }));
      
      // Refresh attendance data
      fetchAttendance();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleBulkAttendance = async () => {
    setMarkingAttendance(true);
    try {
      await Promise.all(
        Object.entries(attendanceData).map(([studentId, status]) =>
          attendance.markAttendance({
            studentId,
            date: new Date(selectedDate),
            status: status as 'present' | 'absent' | 'late' | 'excused'
          })
        )
      );
      fetchAttendance();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
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
            Attendance
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Mark and track student attendance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`p-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <button
            onClick={handleBulkAttendance}
            disabled={markingAttendance}
            className={`px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors ${
              markingAttendance ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Save All
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <th className="p-4">Student</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {students.map((student) => (
                <tr key={student.id} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <td className="p-4">{student.fullName}</td>
                  <td className="p-4">{student.grade}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(attendanceData[student.id] || '')}`}>
                      {attendanceData[student.id]?.charAt(0).toUpperCase() + attendanceData[student.id]?.slice(1) || 'Not marked'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'present')}
                        className={`p-2 rounded-lg ${
                          isDarkMode 
                            ? 'hover:bg-green-900/30 text-green-400' 
                            : 'hover:bg-green-100 text-green-600'
                        }`}
                        title="Mark Present"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'absent')}
                        className={`p-2 rounded-lg ${
                          isDarkMode 
                            ? 'hover:bg-red-900/30 text-red-400' 
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                        title="Mark Absent"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'late')}
                        className={`p-2 rounded-lg ${
                          isDarkMode 
                            ? 'hover:bg-yellow-900/30 text-yellow-400' 
                            : 'hover:bg-yellow-100 text-yellow-600'
                        }`}
                        title="Mark Late"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'excused')}
                        className={`p-2 rounded-lg ${
                          isDarkMode 
                            ? 'hover:bg-blue-900/30 text-blue-400' 
                            : 'hover:bg-blue-100 text-blue-600'
                        }`}
                        title="Mark Excused"
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </button>
                    </div>
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