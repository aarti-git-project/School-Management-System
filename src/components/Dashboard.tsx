import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, Calendar, Settings, Bell, User, School, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  isDarkMode: boolean;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: 'parent' | 'teacher' | 'admin';
}

export function Dashboard({ isDarkMode }: DashboardProps) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const userData = {
      id: '1',
      fullName: localStorage.getItem('fullName') || 'User',
      email: localStorage.getItem('email') || 'user@example.com',
      role: localStorage.getItem('role') as UserData['role'] || 'parent'
    };
    setUserData(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    navigate('/');
  };

  const getRoleIcon = () => {
    switch (userData?.role) {
      case 'teacher':
        return <School className="w-8 h-8" />;
      case 'admin':
        return <ShieldCheck className="w-8 h-8" />;
      default:
        return <User className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-violet-100'}`}>
                {getRoleIcon()}
              </div>
              <div className="ml-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userData?.fullName}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {userData?.role.charAt(0).toUpperCase() + userData?.role.slice(1)} Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {userData?.fullName}!
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You are logged in as a {userData?.role.charAt(0).toUpperCase() + userData?.role.slice(1)}.
          </p>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-violet-100'}`}>
              {getRoleIcon()}
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Role: {userData?.role.charAt(0).toUpperCase() + userData?.role.slice(1)}
            </h3>
          </div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Email: {userData?.email}
          </p>
        </div>
      </main>
    </div>
  );
}