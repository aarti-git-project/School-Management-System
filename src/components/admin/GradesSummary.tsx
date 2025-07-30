import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, TrendingUp, Users, Award } from 'lucide-react';
import axios from 'axios';

interface GradesSummaryProps {
  isDarkMode: boolean;
}

interface GradeSummary {
  grade: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  subjectBreakdown: {
    [key: string]: {
      averageScore: number;
      totalTests: number;
      highestScore: number;
      lowestScore: number;
      scoreDistribution: {
        excellent: number; // 90-100
        good: number;     // 80-89
        average: number;  // 70-79
        needsHelp: number; // Below 70
      };
    };
  };
  teacherPerformance: Array<{
    teacherId: string;
    teacherName: string;
    averageScore: number;
    totalTests: number;
    subjects: string[];
  }>;
}

export function GradesSummary({ isDarkMode }: GradesSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradeSummaries, setGradeSummaries] = useState<{[key: string]: GradeSummary}>({});
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/grades', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Process grades by grade level
      const gradeData: { [key: string]: any } = {};

      response.data.grades.forEach((grade: any) => {
        const gradeLevel = grade.grade;
        if (!gradeData[gradeLevel]) {
          gradeData[gradeLevel] = {
            grade: gradeLevel,
            totalStudents: new Set(),
            scores: [],
            subjects: {},
            teachers: new Map(),
          };
        }

        // Add student to total count
        gradeData[gradeLevel].totalStudents.add(grade.studentId._id);
        gradeData[gradeLevel].scores.push(grade.score);

        // Process subject data
        if (!gradeData[gradeLevel].subjects[grade.subject]) {
          gradeData[gradeLevel].subjects[grade.subject] = {
            scores: [],
            totalTests: 0,
            scoreDistribution: {
              excellent: 0,
              good: 0,
              average: 0,
              needsHelp: 0,
            },
          };
        }

        gradeData[gradeLevel].subjects[grade.subject].scores.push(grade.score);
        gradeData[gradeLevel].subjects[grade.subject].totalTests += 1;

        // Update score distribution
        if (grade.score >= 90) {
          gradeData[gradeLevel].subjects[grade.subject].scoreDistribution.excellent += 1;
        } else if (grade.score >= 80) {
          gradeData[gradeLevel].subjects[grade.subject].scoreDistribution.good += 1;
        } else if (grade.score >= 70) {
          gradeData[gradeLevel].subjects[grade.subject].scoreDistribution.average += 1;
        } else {
          gradeData[gradeLevel].subjects[grade.subject].scoreDistribution.needsHelp += 1;
        }

        // Process teacher data
        const teacherId = grade.teacherId._id;
        if (!gradeData[gradeLevel].teachers.has(teacherId)) {
          gradeData[gradeLevel].teachers.set(teacherId, {
            teacherId,
            teacherName: grade.teacherId.userId.fullName,
            scores: [],
            totalTests: 0,
            subjects: new Set(),
          });
        }
        const teacherData = gradeData[gradeLevel].teachers.get(teacherId);
        teacherData.scores.push(grade.score);
        teacherData.totalTests += 1;
        teacherData.subjects.add(grade.subject);
      });

      // Calculate final summaries
      const processedData = Object.entries(gradeData).reduce((acc, [grade, data]: [string, any]) => {
        const calculateAverage = (arr: number[]) => 
          arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

        // Process subject breakdown
        const subjectBreakdown = Object.entries(data.subjects).reduce((subAcc: any, [subject, subData]: [string, any]) => ({
          ...subAcc,
          [subject]: {
            averageScore: calculateAverage(subData.scores),
            totalTests: subData.totalTests,
            highestScore: Math.max(...subData.scores),
            lowestScore: Math.min(...subData.scores),
            scoreDistribution: subData.scoreDistribution,
          },
        }), {});

        // Process teacher performance
        const teacherPerformance = Array.from(data.teachers.values()).map((teacher: any) => ({
          teacherId: teacher.teacherId,
          teacherName: teacher.teacherName,
          averageScore: calculateAverage(teacher.scores),
          totalTests: teacher.totalTests,
          subjects: Array.from(teacher.subjects),
        }));

        return {
          ...acc,
          [grade]: {
            grade,
            totalStudents: data.totalStudents.size,
            averageScore: calculateAverage(data.scores),
            highestScore: Math.max(...data.scores),
            lowestScore: Math.min(...data.scores),
            subjectBreakdown,
            teacherPerformance,
          },
        };
      }, {});

      setGradeSummaries(processedData);
      if (!selectedGrade && Object.keys(processedData).length > 0) {
        setSelectedGrade(Object.keys(processedData)[0]);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800';
    if (score >= 80) return isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (score >= 70) return isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    return isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800';
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

  const selectedGradeData = selectedGrade ? gradeSummaries[selectedGrade] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Grade Level Analytics
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive grade performance analysis
          </p>
        </div>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className={`p-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          {Object.keys(gradeSummaries).sort().map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      {selectedGradeData && (
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
                {selectedGradeData.totalStudents}
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
                {selectedGradeData.averageScore}%
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
                {selectedGradeData.highestScore}%
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Subjects
                </h3>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {Object.keys(selectedGradeData.subjectBreakdown).length}
              </p>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subject Performance
            </h3>
            <div className="grid gap-4">
              {Object.entries(selectedGradeData.subjectBreakdown).map(([subject, data]) => (
                <div key={subject} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {subject}
                    </h4>
                    <div className={`px-3 py-1 rounded ${getScoreColor(data.averageScore)}`}>
                      {data.averageScore}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Excellent (90-100%)</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {data.scoreDistribution.excellent} students
                      </p>
                    </div>
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Good (80-89%)</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {data.scoreDistribution.good} students
                      </p>
                    </div>
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Average (70-79%)</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {data.scoreDistribution.average} students
                      </p>
                    </div>
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Needs Help (Below 70%)</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {data.scoreDistribution.needsHelp} students
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Performance */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Teacher Performance
            </h3>
            <div className="grid gap-4">
              {selectedGradeData.teacherPerformance.map((teacher) => (
                <div
                  key={teacher.teacherId}
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {teacher.teacherName}
                    </h4>
                    <div className={`px-3 py-1 rounded ${getScoreColor(teacher.averageScore)}`}>
                      {teacher.averageScore}%
                    </div>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subjects: {teacher.subjects.join(', ')}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tests administered: {teacher.totalTests}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}