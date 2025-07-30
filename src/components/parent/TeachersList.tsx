import React, { useState } from "react";
import { GraduationCap, Mail, Users, AlertCircle } from "lucide-react";

interface TeachersListProps {
  isDarkMode: boolean;
  children: Array<{
    id: string;
    fullName: string;
    grade: string;
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
  }>;
}

export function TeachersList({ isDarkMode, children }: TeachersListProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const selectedChild = children.find((child) => child.id === selectedChildId);

  const handleChildClick = (childId: string) => {
    setSelectedChildId(childId);
  };

  if (!children || children.length === 0) {
    return (
      <div
        className={`p-6 rounded-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg text-center`}
      >
        <div className="w-20 h-20 rounded-full bg-violet-100 text-violet-500 flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10" />
        </div>
        <h2
          className={`text-xl font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          No Children Added Yet
        </h2>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Add your children to view their assigned teachers
        </p>
      </div>
    );
  }

  const getTeacherCount = (child: (typeof children)[0]) => {
    let count = 0;
    if (child.classTeacher) count++;
    if (child.subjectTeachers) {
      count += child.subjectTeachers.filter(st => st.teacher).length;
    }
    return count;
  };

  return (
    <>
      {/* Child Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <div
            key={child.id}
            onClick={() => handleChildClick(child.id)}
            className={`cursor-pointer p-4 rounded-lg shadow hover:shadow-md transition-all ${
              isDarkMode 
                ? "bg-gray-800 border-gray-700 hover:bg-gray-750" 
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-violet-100"
                }`}>
                  <GraduationCap className={`w-5 h-5 ${
                    isDarkMode ? "text-violet-400" : "text-violet-600"
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {child.fullName}
                </h3>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                isDarkMode 
                  ? "bg-violet-900/50 text-violet-400" 
                  : "bg-violet-100 text-violet-600"
              }`}>
                {getTeacherCount(child)} Teachers
              </span>
            </div>
            <p className={`text-sm mb-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              {child.grade}
            </p>
            <div className={`space-y-1 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              {child.classTeacher && (
                <div className={`p-2 rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}>
                  Class Teacher: {child.classTeacher.fullName}
                </div>
              )}
              <div className={`p-2 rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}>
                {child.subjectTeachers.filter(st => st.teacher).length} Subject Teachers
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Child Details */}
      {selectedChild && (
        <div className={`mt-6 p-6 rounded-lg shadow ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                {selectedChild.fullName}'s Teachers
              </h2>
              <p className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                {selectedChild.grade}
              </p>
            </div>
          </div>

          {/* Class Teacher Section */}
          <div className="mb-6">
            <h3 className={`text-sm font-medium mb-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Class Teacher
            </h3>
            {selectedChild.classTeacher ? (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-violet-50"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedChild.classTeacher.fullName}
                    </p>
                    <a
                      href={`mailto:${selectedChild.classTeacher.email}`}
                      className={`text-sm inline-flex items-center gap-1 mt-1 ${
                        isDarkMode 
                          ? "text-violet-400 hover:text-violet-300" 
                          : "text-violet-600 hover:text-violet-500"
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      {selectedChild.classTeacher.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`text-sm italic ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}>
                No class teacher assigned yet
              </p>
            )}
          </div>

          {/* Subject Teachers Section */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Subject Teachers
            </h3>
            <div className="space-y-3">
              {selectedChild.subjectTeachers.length > 0 ? (
                selectedChild.subjectTeachers.map((st, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        isDarkMode 
                          ? "bg-blue-900/50 text-blue-400" 
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {st.subject}
                      </span>
                    </div>
                    {st.teacher ? (
                      <div>
                        <p className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {st.teacher.fullName}
                        </p>
                        <a
                          href={`mailto:${st.teacher.email}`}
                          className={`text-sm inline-flex items-center gap-1 ${
                            isDarkMode 
                              ? "text-violet-400 hover:text-violet-300" 
                              : "text-violet-600 hover:text-violet-500"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          {st.teacher.email}
                        </a>
                      </div>
                    ) : (
                      <p className={`text-sm italic ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}>
                        No teacher assigned yet
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm italic ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}>
                  No subject teachers assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedChild && (
        <div className={`text-center mt-6 p-4 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-gray-50"
        }`}>
          <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`} />
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Select a child to view their teachers
          </p>
        </div>
      )}
    </>
  );
}