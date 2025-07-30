import React from 'react';
import { School } from 'lucide-react';

interface LogoProps {
  isDarkMode: boolean;
  className?: string;
}

export function Logo({ isDarkMode, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <School className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
      <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        My Happy School
      </span>
    </div>
  );
}