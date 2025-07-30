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
  GraduationCap,
  Home,
  Users,
  LogOut,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { teacher } from "../lib/api";
import { MessagesTab } from "./MessagesTab";
import { Logo } from "./Logo";
import { GradesList } from "./teacher/GradesList";
import { AssignmentsTab } from "./parent/AssignmentsTab";
interface TeacherDashboardProps {
  isDarkMode: boolean;
}

interface Student {
  _id: string;
  fullName: string;
  grade: string;
  subjects: string[];
  isClassTeacher: boolean;
}

interface Parent {
  fullName: string;
  email: string;
  phone: string;
  children: Array<{
    name: string;
    grade: string;
  }>;
}

export function TeacherDashboard({ isDarkMode }: TeacherDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("fullName") || "Teacher";

  const [data, setData] = useState<{
    students: Student[];
    parents: Parent[];
    loading: boolean;
    error: string;
  }>({
    students: [],
    parents: [],
    loading: true,
    error: "",
  });

  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const [studentsRes, parentsRes] = await Promise.all([
          teacher.getStudents(),
          teacher.getParents(),
        ]);

        // Format parents data correctly
        const parents = parentsRes.data.parents.map((parent: any) => ({
          id: parent.userId?._id || parent._id,
          fullName: parent.userId?.fullName || parent.fullName,
          email: parent.userId?.email || parent.email,
          role: "parent",
        }));

        setAvailableRecipients(parents);
      } catch (err) {
        console.error("Error fetching recipients:", err);
      }
    };

    fetchRecipients();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, parentsRes] = await Promise.all([
          teacher.getStudents(),
          teacher.getParents(),
        ]);

        setData({
          students: studentsRes.data.students || [],
          parents: parentsRes.data.parents || [],
          loading: false,
          error: "",
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err.response?.data?.message || "Failed to fetch data",
        }));
      }
    };

    fetchData();
  }, []);

  if (!role || role !== "teacher") {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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
            : "bg-green-100 text-green-600"
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

  const StudentsList = () => (
    <div className="space-y-6">
      <div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          My Students
        </h2>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          View and manage your assigned students
        </p>
      </div>

      {data.students.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h2
            className={`text-xl font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            No Students Assigned Yet
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Students will be assigned to you by the school administration
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {data.students.map((student) => (
            <div
              key={student._id}
              className={`p-6 rounded-xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3
                    className={`text-xl font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {student.fullName}
                  </h3>
                  {student.isClassTeacher && (
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        isDarkMode
                          ? "bg-green-900/50 text-green-400"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Class Teacher
                    </span>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? "bg-blue-900/50 text-blue-400"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {student.grade}
                </span>
              </div>
              <div>
                <h4
                  className={`text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {student.isClassTeacher
                    ? "All Subjects"
                    : "Subjects You Teach"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ParentsList = () => (
    <div className="space-y-6">
      <div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Parents
        </h2>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Contact information for your students' parents
        </p>
      </div>

      {data.parents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h2
            className={`text-xl font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            No Parents Available
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Parent information will be available once students are assigned
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {data.parents.map((parent, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <h3
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {parent.fullName}
              </h3>

              {/* Children Information */}
              <div className="mb-4">
                <h4
                  className={`text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Children
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parent.children.map((child, childIdx) => (
                    <div
                      key={childIdx}
                      className={`px-3 py-1 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{child.name}</span>
                      <span
                        className={`text-sm ml-2 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {child.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <a
                  href={`mailto:${parent.email}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg w-fit transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  {parent.email}
                </a>
                <a
                  href={`tel:${parent.phone}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg w-fit transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  {parent.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
          <NavLink to="/dashboard/teacher" icon={Home}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/teacher/students" icon={BookOpen}>
            Students
          </NavLink>
          <NavLink to="/dashboard/teacher/parents" icon={Users}>
            Parents
          </NavLink>
          <NavLink to="/dashboard/teacher/messages" icon={MessageSquare}>
            Messages
          </NavLink>
          <NavLink to="/dashboard/teacher/grades" icon={BookOpen}>
            Grades
          </NavLink>

          <NavLink to="/dashboard/teacher/assignments" icon={BookOpen}>
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
          {data.loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : data.error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {data.error}
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
                        Here's an overview of your teaching assignments
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatCard
                        icon={BookOpen}
                        title="Total Students"
                        value={data.students.length}
                        color={
                          isDarkMode
                            ? "bg-green-900/50 text-green-400"
                            : "bg-green-100 text-green-600"
                        }
                      />
                      <StatCard
                        icon={Users}
                        title="Total Parents"
                        value={data.parents.length}
                        color={
                          isDarkMode
                            ? "bg-blue-900/50 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }
                      />
                      <StatCard
                        icon={GraduationCap}
                        title="Subjects Teaching"
                        value={
                          new Set(data.students.flatMap((s) => s.subjects)).size
                        }
                        color={
                          isDarkMode
                            ? "bg-violet-900/50 text-violet-400"
                            : "bg-violet-100 text-violet-600"
                        }
                      />
                    </div>
                  </div>
                }
              />
              <Route path="/students" element={<StudentsList />} />
              <Route path="/parents" element={<ParentsList />} />
              <Route
                path="/messages"
                element={
                  <MessagesTab
                    isDarkMode={isDarkMode}
                    userRole="teacher"
                    availableRecipients={availableRecipients}
                  />
                }
              />
              <Route
                path="/grades"
                element={
                  <GradesList
                    isDarkMode={isDarkMode}
                    students={data.students.map((s) => ({
                      id: s._id,
                      fullName: s.fullName,
                      grade: s.grade,
                    }))}
                  />
                }
              />

              <Route
                path="/assignments"
                element={<AssignmentsTab isDarkMode={isDarkMode} />}
              />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}
