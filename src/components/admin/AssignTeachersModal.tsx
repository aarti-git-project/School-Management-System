import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import axios from "axios";

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  subjects: string[];
  grade: string;
  status: string;
}

interface Student {
  id: string;
  fullName: string;
  grade: string;
  subjects: string[];
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

interface AssignTeachersModalProps {
  student: Student;
  onClose: (updatedStudent?: Student) => void;
  isDarkMode: boolean;
}

export function AssignTeachersModal({
  student,
  onClose,
  isDarkMode,
}: AssignTeachersModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    classTeacherId: student.classTeacher?.id || "",
    subjectTeachers: student.subjects.map((subject) => ({
      subject,
      teacherId:
        student.subjectTeachers.find((st) => st.subject === subject)?.teacher
          .id || "",
    })),
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allTeachers = response.data?.teachers;
      if (!Array.isArray(allTeachers)) {
        throw new Error("Invalid teacher data format from server.");
      }

      const approvedTeachers = allTeachers.filter(
        (teacher: Teacher) => teacher?.status === "approved"
      );

      setTeachers(approvedTeachers);
      setError("");
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      setError(err.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (!formData.classTeacherId) {
      setError("Please select a class teacher");
      setSubmitting(false);
      return;
    }

    const missingSubjectTeachers = formData.subjectTeachers.some(
      (st) => !st.teacherId
    );
    if (missingSubjectTeachers) {
      setError("Please select all subject teachers");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/admin/assign-teachers",
        {
          studentId: student.id,
          classTeacherId: formData.classTeacherId,
          subjectTeachers: formData.subjectTeachers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Teachers assigned successfully!");

      setTimeout(() => {
        if (response.data.child) {
          onClose(response.data.child);
        } else {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      console.error("Error assigning teachers:", err);
      setError(err.response?.data?.message || "Failed to assign teachers");
      setSubmitting(false);
    }
  };

  const handleSubjectTeacherChange = (subject: string, teacherId: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectTeachers: prev.subjectTeachers.map((st) =>
        st.subject === subject ? { ...st, teacherId } : st
      ),
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`p-8 rounded-xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-xl`}
        >
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent"></div>
            <p className={isDarkMode ? "text-white" : "text-gray-900"}>
              Loading teachers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`w-full max-w-2xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-xl shadow-xl`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Assign Teachers to {student.fullName}
          </h2>
          <button
            onClick={() => onClose()}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label
              className={`block mb-2 font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Class Teacher
            </label>
            <select
              value={formData.classTeacherId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  classTeacherId: e.target.value,
                }))
              }
              required
              className={`w-full p-3 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-violet-500`}
            >
              <option value="">Select Class Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName} ({teacher.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h3
              className={`font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Subject Teachers
            </h3>
            {formData.subjectTeachers.map((st, index) => (
              <div key={index}>
                <label
                  className={`block mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {st.subject}
                </label>
                <select
                  value={st.teacherId}
                  onChange={(e) =>
                    handleSubjectTeacherChange(st.subject, e.target.value)
                  }
                  required
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-violet-500`}
                >
                  <option value="">Select Teacher</option>
                  {teachers
                    .filter((teacher) => {
                      if (!Array.isArray(teacher.subjects)) return false;
                      return teacher.subjects.some(
                        (subj) =>
                          typeof subj === "string" &&
                          subj.trim().toLowerCase() ===
                            st.subject.trim().toLowerCase()
                      );
                    })
                    .map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.fullName} ({teacher.grade})
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => onClose()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-violet-600 text-white rounded-lg transition-colors ${
                submitting
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-violet-700"
              }`}
            >
              {submitting ? "Saving..." : "Save Assignments"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}