import React from 'react';
import { TrendingUp, Award, AlertTriangle, Users } from 'lucide-react';

interface GradesAnalyticsProps {
  isDarkMode: boolean;
  grades: Array<{
    score: number;
    subject: string;
    testTitle: string;
    studentId: {
      fullName: string;
      grade: string;
    };
  }>;
  selectedGrade: string;
}

export function GradesAnalytics({ isDarkMode, grades, selectedGrade }: GradesAnalyticsProps) {
  const filteredGrades = selectedGrade === 'all' 
    ? grades 
    : grades.filter(grade => grade.studentId.grade === selectedGrade);

  const calculateStats = () => {
    if (filteredGrades.length === 0) return null;

    const scores = filteredGrades.map(g => g.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const uniqueStudents = new Set(filteredGrades.map(g => g.studentId._id)).size;

    const subjectBreakdown = filteredGrades.reduce((acc: any, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = {
          scores: [],
          totalTests: 0,
          students: new Set()
        };
      }
      acc[grade.subject].scores.push(grade.score);
      acc[grade.subject].totalTests += 1;
      acc[grade.subject].students.add(grade.studentId._id);
      return acc;
    }, {});

    Object.keys(subjectBreakdown).forEach(subject => {
      const scores = subjectBreakdown[subject].scores;
      subjectBreakdown[subject].average = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      subjectBreakdown[subject].studentCount = subjectBreakdown[subject].students.size;
      delete subjectBreakdown[subject].students; // Clean up Set before returning
    });

    const performanceDistribution = {
      excellent: scores.filter(s => s >= 90).length,
      good: scores.filter(s => s >= 80 && s < 90).length,
      average: scores.filter(s => s >= 70 && s < 80).length,
      needsHelp: scores.filter(s => s < 70).length,
    };

    return {
      averageScore,
      highestScore,
      lowestScore,
      uniqueStudents,
      subjectBreakdown,
      performanceDistribution
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <Users className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Total Students
            </h3>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.uniqueStudents}
          </p>
        </div>

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

      {/* Performance Distribution */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
              Excellent (90-100%)
            </h4>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
              {stats.performanceDistribution.excellent}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
              Good (80-89%)
            </h4>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
              {stats.performanceDistribution.good}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
              Average (70-79%)
            </h4>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
              {stats.performanceDistribution.average}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
              Needs Help (Below 70%)
            </h4>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
              {stats.performanceDistribution.needsHelp}
            </p>
          </div>
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
              <div className="flex items-center gap-4 text-sm">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Students: {data.studentCount}
                </p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tests: {data.totalTests}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}