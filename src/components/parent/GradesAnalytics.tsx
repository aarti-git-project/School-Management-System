import React from 'react';
import { TrendingUp, Award, AlertTriangle } from 'lucide-react';

interface GradesAnalyticsProps {
  isDarkMode: boolean;
  grades: Array<{
    score: number;
    subject: string;
    testTitle: string;
    studentId: {
      fullName: string;
    };
  }>;
  selectedChild: string;
}

export function GradesAnalytics({ isDarkMode, grades, selectedChild }: GradesAnalyticsProps) {
  const filteredGrades = selectedChild === 'all' 
    ? grades 
    : grades.filter(grade => grade.studentId._id === selectedChild);

  const calculateStats = () => {
    if (filteredGrades.length === 0) return null;

    const scores = filteredGrades.map(g => g.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const subjectBreakdown = filteredGrades.reduce((acc: any, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = {
          scores: [],
          totalTests: 0
        };
      }
      acc[grade.subject].scores.push(grade.score);
      acc[grade.subject].totalTests += 1;
      return acc;
    }, {});

    Object.keys(subjectBreakdown).forEach(subject => {
      const scores = subjectBreakdown[subject].scores;
      subjectBreakdown[subject].average = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    });

    const needsAttention = Object.entries(subjectBreakdown)
      .filter(([_, data]: [string, any]) => data.average < 70)
      .map(([subject]) => subject);

    return {
      averageScore,
      highestScore,
      lowestScore,
      subjectBreakdown,
      needsAttention
    };
  };

  const stats = calculateStats();
  if (!stats) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800';
    if (score >= 80) return isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (score >= 70) return isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    return isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Average Score
            </h3>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.averageScore}%
          </p>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <Award className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Highest Score
            </h3>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.highestScore}%
          </p>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Lowest Score
            </h3>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.lowestScore}%
          </p>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Subject Performance
        </h3>
        <div className="grid gap-4">
          {Object.entries(stats.subjectBreakdown).map(([subject, data]: [string, any]) => (
            <div key={subject} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {subject}
                </h4>
                <div className={`px-3 py-1 rounded ${getScoreColor(data.average)}`}>
                  {data.average}%
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tests taken: {data.totalTests}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Areas Needing Attention */}
      {stats.needsAttention.length > 0 && (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${
          isDarkMode ? 'border-red-800/30' : 'border-red-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-900'}`}>
              Areas Needing Attention
            </h3>
          </div>
          <ul className="space-y-2">
            {stats.needsAttention.map(subject => (
              <li key={subject} className={`${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                • {subject} (Average below 70%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}