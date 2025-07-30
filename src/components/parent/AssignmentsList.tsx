import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { assignments, submissions } from '../../lib/api';
import { format, isPast } from 'date-fns';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  dueDate: string;
  teacherId: {
    userId: {
      fullName: string;
      email: string;
    };
  };
}

interface Child {
  id: string;
  fullName: string;
  grade: string;
}

interface AssignmentsListProps {
  isDarkMode: boolean;
  children: Child[];
}

export function AssignmentsList({ isDarkMode, children }: AssignmentsListProps) {
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await assignments.getAll();
      setAssignmentsList(response.data.assignments);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!selectedChild || !answer.trim()) {
      return;
    }

    try {
      await submissions.submit({
        assignmentId,
        childId: selectedChild,
        answer
      });
      setAnswer('');
      setSelectedChild('');
      fetchAssignments();
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Assignments
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          View and submit assignments for your children
        </p>
      </div>

      <div className="grid gap-6">
        {assignmentsList.map((assignment) => (
          <div
            key={assignment._id}
            className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-violet-100'}`}>
                  <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {assignment.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {assignment.subject} • {assignment.grade}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${
                  isPast(new Date(assignment.dueDate))
                    ? 'text-red-500'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>

            <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="mb-2">{assignment.description}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Teacher: {assignment.teacherId.userId.fullName}
              </p>
            </div>

            {!isPast(new Date(assignment.dueDate)) && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Child
                  </label>
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select a child</option>
                    {children
                      .filter(child => child.grade === assignment.grade)
                      .map(child => (
                        <option key={child.id} value={child.id}>
                          {child.fullName}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                    className={`w-full p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your answer here..."
                  />
                </div>

                <button
                  onClick={() => handleSubmit(assignment._id)}
                  disabled={!selectedChild || !answer.trim()}
                  className={`w-full py-3 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors ${
                    (!selectedChild || !answer.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Submit Assignment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}