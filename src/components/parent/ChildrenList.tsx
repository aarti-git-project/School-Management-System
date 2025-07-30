import React from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

interface Child {
  id: string;
  fullName: string;
  age: number;
  grade: string;
  subjects: string[];
  classTeacher?: {
    fullName: string;
    email: string;
  } | null;
  subjectTeachers: Array<{
    subject: string;
    fullName: string;
  }>;
}

interface ChildrenListProps {
  isDarkMode: boolean;
  children: Child[];
}

export function ChildrenList({ isDarkMode, children }: ChildrenListProps) {
  const ChildCard = ({ child }: { child: Child }) => (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-6`}>
      {/* Child Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {child.fullName}
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {child.age} years old • {child.grade}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-violet-100'}`}>
          <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-violet-600'}`} />
        </div>
      </div>

      {/* Subjects */}
      <div className="space-y-2">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Subjects
        </h4>
        <div className="flex flex-wrap gap-2">
          {child.subjects.map((subject, index) => (
            <span
              key={index}
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
      </div>

      {/* Class Teacher */}
      {child.classTeacher && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Class Teacher
            </h4>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {child.classTeacher.fullName}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {child.classTeacher.email}
            </p>
          </div>
        </div>
      )}

      {/* Subject Teachers */}
      {child.subjectTeachers.length > 0 && (
        <div className="space-y-4">
          <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Subject Teachers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {child.subjectTeachers.map((teacher, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-violet-400' : 'text-violet-600'
                }`}>
                  {teacher.subject}
                </p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {teacher.fullName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid gap-6">
      {children.map(child => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  );
}