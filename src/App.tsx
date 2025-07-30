import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { TeacherSignUpForm } from './components/TeacherSignUpForm';
import { AdminSignUpForm } from './components/AdminSignUpForm';
import { BrandSection } from './components/BrandSection';
import ParentDashboard from './components/ParentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSignupSuccess = () => {
    console.log('Signup successful');
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  const AuthLayout = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 h-screen flex">
        <BrandSection isDarkMode={isDarkMode} />
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className={`w-full max-w-md p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h2>
              <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AuthLayout title="Welcome Back!">
            <LoginForm isDarkMode={isDarkMode} />
          </AuthLayout>
        } />
        <Route path="/signup" element={
          <AuthLayout title="Create Parent Account">
            <SignUpForm 
              isDarkMode={isDarkMode} 
              onSuccess={handleSignupSuccess} 
            />
          </AuthLayout>
        } />
        <Route path="/signup/teacher" element={
          <AuthLayout title="Create Teacher Account">
            <TeacherSignUpForm 
              isDarkMode={isDarkMode} 
              onSuccess={handleSignupSuccess} 
            />
          </AuthLayout>
        } />
        <Route path="/signup/admin" element={
          <AuthLayout title="Create Admin Account">
            <AdminSignUpForm 
              isDarkMode={isDarkMode} 
              onSuccess={handleSignupSuccess} 
            />
          </AuthLayout>
        } />
        <Route path="/dashboard/parent/*" element={
          <ProtectedRoute>
            <ParentDashboard isDarkMode={isDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/*" element={
          <ProtectedRoute>
            <TeacherDashboard isDarkMode={isDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard isDarkMode={isDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navigate to={`/dashboard/${localStorage.getItem('role') || 'parent'}`} replace />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;