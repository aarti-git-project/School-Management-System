import React from 'react';
import { Logo } from './Logo';

interface BrandSectionProps {
  isDarkMode: boolean;
}

export function BrandSection({ isDarkMode }: BrandSectionProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12">
      <div className="mb-6">
        <Logo isDarkMode={isDarkMode} className="scale-150 mb-6" />
      </div>
      <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Where every child's smile brightens our day!
      </p>
      <img
        src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80"
        alt="Happy students"
        className="rounded-2xl shadow-2xl w-full max-w-2xl object-cover"
      />
    </div>
  );
}