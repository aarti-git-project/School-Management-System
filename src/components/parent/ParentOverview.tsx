import React from 'react';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

interface ParentOverviewProps {
  isDarkMode: boolean;
  stats: {
    totalChildren: number;
    totalSubjects: number;
    totalTeachers: number;
  };
}

export function ParentOverview({ isDarkMode, stats }: ParentOverviewProps) {
  const StatCard = ({ icon: Icon, title, value, color }: { icon: any; title: string; value: number; color: string }) => (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={Users}
        title="Total Children"
        value={stats.totalChildren}
        color={isDarkMode ? 'bg-violet-900/50 text-violet-400' : 'bg-violet-100 text-violet-600'}
      />
      <StatCard
        icon={BookOpen}
        title="Total Subjects"
        value={stats.totalSubjects}
        color={isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}
      />
      <StatCard
        icon={GraduationCap}
        title="Teachers Involved"
        value={stats.totalTeachers}
        color={isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'}
      />
    </div>
  );
}