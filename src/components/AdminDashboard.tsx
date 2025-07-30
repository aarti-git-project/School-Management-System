import React, { useState, useEffect } from "react";
import {
  Navigate,
  useNavigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  Home,
  MessageSquare,
} from "lucide-react";
import { TeachersTable } from "./admin/TeachersTable";
import { ParentsTable } from "./admin/ParentsTable";
import { StudentsTable } from "./admin/StudentsTable";
import { MessagesTab } from "./MessagesTab";
import { GradesSummary } from "./admin/GradesSummary";

import { Logo } from "./Logo";
import axios from "axios";

interface AdminDashboardProps {
  isDarkMode: boolean;
}

interface DashboardStats {
  totalTeachers: number;
  totalParents: number;
  totalStudents: number;
  pendingTeachers: number;
  pendingParents: number;
}

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  subjects: string[];
  grade: string;
  status: string;
}

interface Parent {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  childCount: number;
}

interface Student {
  id: string;
  fullName: string;
  age: number;
  grade: string;
  subjects: string[];
  parentName: string;
  parentEmail: string;
  classTeacher: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  subjectTeachers: Array<{
    subject: string;
    teacher: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
}

interface Recipient {
  id: string;
  fullName: string;
  email: string;
  role: "teacher" | "parent";
}

export function AdminDashboard({ isDarkMode }: AdminDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("fullName") || "Admin";

  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalParents: 0,
    totalStudents: 0,
    pendingTeachers: 0,
    pendingParents: 0,
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableRecipients, setAvailableRecipients] = useState<Recipient[]>(
    []
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { teachers = [], parents = [], students = [] } = response.data;

      // Transform teacher data
      const formattedTeachers = teachers.map((t: any) => ({
        _id: t._id,
        fullName: t.fullName,
        email: t.email,
        phone: t.phone,
        subjects: t.subjects,
        grade: t.grade,
        status: t.status,
      }));

      // Transform parent data
      const formattedParents = parents.map((p: any) => ({
        _id: p._id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        status: p.status,
        childCount: p.childCount || 0,
      }));

      setTeachers(formattedTeachers);
      setParents(formattedParents);
      setStudents(students);

      setStats({
        totalTeachers: formattedTeachers.length,
        totalParents: formattedParents.length,
        totalStudents: students.length,
        pendingTeachers: formattedTeachers.filter((t) => t.status === "pending")
          .length,
        pendingParents: formattedParents.filter((p) => p.status === "pending")
          .length,
      });

      // Set up recipients for messaging
      const allRecipients = [
        ...formattedTeachers.map((t) => ({
          id: t._id,
          fullName: t.fullName,
          email: t.email,
          role: "teacher" as const,
        })),
        ...formattedParents.map((p) => ({
          id: p._id,
          fullName: p.fullName,
          email: p.email,
          role: "parent" as const,
        })),
      ];

      setAvailableRecipients(allRecipients);
      setError("");
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!role || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const NavLink = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
        location.pathname === to
          ? isDarkMode
            ? "bg-gray-700 text-white"
            : "bg-blue-100 text-blue-600"
          : isDarkMode
          ? "text-gray-400 hover:bg-gray-700 hover:text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
  }: {
    icon: any;
    title: string;
    value: number;
    color: string;
  }) => (
    <div
      className={`p-6 rounded-xl ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-2xl font-bold ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`w-64 flex flex-col fixed h-full ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } border-r ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="p-6">
          <Logo isDarkMode={isDarkMode} />
        </div>

        <nav className="flex-1 px-4">
          <NavLink to="/dashboard/admin" icon={Home}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/admin/teachers" icon={GraduationCap}>
            Teachers
          </NavLink>
          <NavLink to="/dashboard/admin/parents" icon={Users}>
            Parents
          </NavLink>
          <NavLink to="/dashboard/admin/students" icon={BookOpen}>
            Students
          </NavLink>
          <NavLink to="/dashboard/admin/grades" icon={Building2}>
            Grades
          </NavLink>
          <NavLink to="/dashboard/admin/messages" icon={MessageSquare}>
            Messages
          </NavLink>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-8">
                  <div>
                    <h1
                      className={`text-3xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Welcome back, {userName}!
                    </h1>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Here's an overview of your school's current status
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                      icon={GraduationCap}
                      title="Total Teachers"
                      value={stats.totalTeachers}
                      color={
                        isDarkMode
                          ? "bg-blue-900/50 text-blue-400"
                          : "bg-blue-100 text-blue-600"
                      }
                    />
                    <StatCard
                      icon={Users}
                      title="Total Parents"
                      value={stats.totalParents}
                      color={
                        isDarkMode
                          ? "bg-green-900/50 text-green-400"
                          : "bg-green-100 text-green-600"
                      }
                    />
                    <StatCard
                      icon={BookOpen}
                      title="Total Students"
                      value={stats.totalStudents}
                      color={
                        isDarkMode
                          ? "bg-violet-900/50 text-violet-400"
                          : "bg-violet-100 text-violet-600"
                      }
                    />
                  </div>

                  <div
                    className={`p-6 rounded-xl ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } shadow-lg`}
                  >
                    <h2
                      className={`text-xl font-semibold mb-4 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Pending Approvals
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }
                        >
                          Teachers pending approval
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            isDarkMode
                              ? "bg-yellow-900/50 text-yellow-400"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {stats.pendingTeachers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }
                        >
                          Parents pending approval
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            isDarkMode
                              ? "bg-yellow-900/50 text-yellow-400"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {stats.pendingParents}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path="/teachers"
              element={
                <TeachersTable
                  teachers={teachers}
                  isDarkMode={isDarkMode}
                  onStatusUpdate={fetchData}
                />
              }
            />
            <Route
              path="/parents"
              element={
                <ParentsTable parents={parents} isDarkMode={isDarkMode} />
              }
            />
            <Route
              path="/students"
              element={
                <StudentsTable isDarkMode={isDarkMode} students={students} />
              }
            />
            <Route
              path="/grades"
              element={<GradesSummary isDarkMode={isDarkMode} />}
            />

            <Route
              path="/messages"
              element={
                <MessagesTab
                  isDarkMode={isDarkMode}
                  userRole="admin"
                  availableRecipients={availableRecipients}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}
