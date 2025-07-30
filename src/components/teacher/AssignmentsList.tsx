import React, { useState, useEffect } from "react";
import {
  BookOpen,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { assignments, submissions } from "../../lib/api";
import { format, isPast } from "date-fns";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  dueDate: string;
  submissions: Array<{
    _id: string;
    childId: {
      fullName: string;
    };
    status: "pending" | "graded";
    grade?: number;
    submittedAt: string;
  }>;
}

interface AssignmentsListProps {
  isDarkMode: boolean;
}

export function AssignmentsList({ isDarkMode }: AssignmentsListProps) {
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await assignments.getAll();
      setAssignmentsList(response.data || []); // ✅ Correct state name
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (
    submissionId: string,
    grade: number,
    feedback: string
  ) => {
    try {
      await submissions.grade(submissionId, { grade, feedback });
      fetchAssignments();
    } catch (err: any) {
      console.error("Error grading submission:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Assignments
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage and track student assignments
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {assignmentsList.map((assignment) => (
          <div
            key={assignment._id}
            className={`p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-violet-100"
                  }`}
                >
                  <BookOpen
                    className={`w-6 h-6 ${
                      isDarkMode ? "text-violet-400" : "text-violet-600"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-xl font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {assignment.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {assignment.subject} • {assignment.grade}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isPast(new Date(assignment.dueDate))
                      ? "text-red-500"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Due:{" "}
                  {format(new Date(assignment.dueDate), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>

            <p
              className={`mb-4 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {assignment.description}
            </p>

            <div className="mt-6">
              <h4
                className={`font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Submissions ({assignment.submissions?.length || 0})
              </h4>
              <div className="space-y-3">
                {assignment.submissions?.map((submission) => (
                  <div
                    key={submission._id}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {submission.childId.fullName}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Submitted:{" "}
                          {format(
                            new Date(submission.submittedAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.status === "graded" ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span
                              className={`font-medium ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Grade: {submission.grade}%
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAssignment(assignment)}
                            className={`px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-violet-600 hover:bg-violet-700"
                                : "bg-violet-100 hover:bg-violet-200"
                            } text-sm font-medium transition-colors`}
                          >
                            Grade Submission
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
