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
  Heart,
  Home,
  Users,
  LogOut,
  PlusCircle,
  BookOpen,
  GraduationCap,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Logo } from "./Logo";
import { AddChildForm } from "./AddChildForm";
import { parent } from "../lib/api";
import { MessagesTab } from "./MessagesTab";
import { TeachersList } from "./parent/TeachersList";
import { ChildrenList } from "./parent/ChildrenList";
import { ParentOverview } from "./parent/ParentOverview";
import { GradesList } from "./parent/GradesList";
import { AssignmentsTab } from "./parent/AssignmentsTab";

interface ParentDashboardProps {
  isDarkMode: boolean;
}

interface Child {
  id: string;
  fullName: string;
  age: number;
  grade: string;
  subjects: string[];
  classTeacher?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  subjectTeachers: Array<{
    subject: string;
    teacher?: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
}

export function ParentDashboard({ isDarkMode }: ParentDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("fullName") || "Parent";
  const [showAddChild, setShowAddChild] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableRecipients, setAvailableRecipients] = useState([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await parent.getChildren();
        const children = response.data.children || [];

        const recipients = children.filter(Boolean).flatMap((child) => {
          const teachers = [];

          if (child?.classTeacher) {
            teachers.push({
              id: child.classTeacher?.id ?? "",
              fullName: child.classTeacher?.fullName ?? "",
              email: child.classTeacher?.email ?? "",
              role: "teacher",
            });
          }

          (child?.subjectTeachers || []).forEach((st) => {
            if (st?.teacher) {
              teachers.push({
                id: st.teacher?.id ?? "",
                fullName: st.teacher?.fullName ?? "",
                email: st.teacher?.email ?? "",
                role: "teacher",
              });
            }
          });

          return teachers;
        });

        const uniqueRecipients = [
          ...new Map(recipients.map((item) => [item.id, item])).values(),
        ];
        setAvailableRecipients(uniqueRecipients);
      } catch (err) {
        console.error("Error fetching recipients:", err);
      }
    };

    fetchRecipients();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await parent.getChildren();
      setChildren(response.data.children || []);
      setError("");
    } catch (err: any) {
      console.error("Error fetching children:", err);
      setError(err.response?.data?.message || "Failed to fetch children");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleAddChildSuccess = () => {
    setShowAddChild(false);
    fetchChildren();
  };

  if (!role || role !== "parent") {
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
            : "bg-rose-100 text-rose-600"
          : isDarkMode
          ? "text-gray-400 hover:bg-gray-700 hover:text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );

  const stats = {
    totalChildren: children.length,
    totalSubjects: children.reduce(
      (acc, child) => acc + child.subjects.length,
      0
    ),
    totalTeachers: children.reduce((acc, child) => {
      const teacherCount =
        (child.classTeacher ? 1 : 0) + (child.subjectTeachers?.length || 0);
      return acc + teacherCount;
    }, 0),
  };

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
          <NavLink to="/dashboard/parent" icon={Home}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/parent/children" icon={Users}>
            Children
          </NavLink>
          <NavLink to="/dashboard/parent/teachers" icon={GraduationCap}>
            Teachers
          </NavLink>
          <NavLink to="/dashboard/parent/grades" icon={BookOpen}>
            Grades
          </NavLink>
          <NavLink to="/dashboard/parent/messages" icon={MessageSquare}>
            Messages
          </NavLink>
          <NavLink to="/dashboard/parent/assignments" icon={BookOpen}>
            Assignments
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
        <div className="max-w-4xl mx-auto">
          {showAddChild ? (
            <AddChildForm
              isDarkMode={isDarkMode}
              onSuccess={handleAddChildSuccess}
            />
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          ) : (
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
                        Welcome back, {userName}
                      </h1>
                      <p
                        className={`${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Here's an overview of your children's education
                      </p>
                    </div>

                    <ParentOverview isDarkMode={isDarkMode} stats={stats} />
                  </div>
                }
              />
              <Route
                path="/children"
                element={
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2
                          className={`text-2xl font-bold mb-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          My Children
                        </h2>
                        <p
                          className={`${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Manage and monitor your children's education
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddChild(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        <PlusCircle className="w-5 h-5" />
                        Add Child
                      </button>
                    </div>

                    <ChildrenList isDarkMode={isDarkMode} children={children} />
                  </div>
                }
              />
              <Route
                path="/teachers"
                element={
                  <div className="space-y-6">
                    <div>
                      <h2
                        className={`text-2xl font-bold mb-2 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Teachers
                      </h2>
                      <p
                        className={`${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        View all teachers assigned to your children
                      </p>
                    </div>

                    <TeachersList isDarkMode={isDarkMode} children={children} />
                  </div>
                }
              />

              <Route
                path="/grades"
                element={
                  <GradesList
                    isDarkMode={isDarkMode}
                    children={children.map((child) => ({
                      id: child.id,
                      fullName: child.fullName,
                      grade: child.grade,
                    }))}
                  />
                }
              />
              <Route
                path="/assignments"
                element={<AssignmentsTab isDarkMode={isDarkMode} />}
              />

              <Route
                path="/messages"
                element={
                  <MessagesTab
                    isDarkMode={isDarkMode}
                    userRole="parent"
                    availableRecipients={availableRecipients}
                  />
                }
              />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
