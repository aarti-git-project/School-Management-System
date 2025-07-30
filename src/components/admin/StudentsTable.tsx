import React, { useState, useEffect } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { AssignTeachersModal } from "./AssignTeachersModal";
import { AlertCircle } from "lucide-react";

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
interface StudentsTableProps {
  isDarkMode: boolean;
  students: Student[];
}

export function StudentsTable({ isDarkMode, students }: StudentsTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentList, setStudentList] = useState(students); // local modifiable state

  useEffect(() => {
    setStudentList(students); // sync prop to local
  }, [students]);

  const columnHelper = createColumnHelper<Student>();

  const handleTeacherAssignment = (updatedStudent: Student) => {
    setStudentList((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
    setSelectedStudent(null);
  };

  const columns = [
    columnHelper.accessor("fullName", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("age", {
      header: "Age",
      cell: (info) => `${info.getValue()} years`,
    }),
    columnHelper.accessor("grade", {
      header: "Grade",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("subjects", {
      header: "Subjects",
      cell: (info) => (
        <div className="flex flex-wrap gap-2">
          {info.getValue().map((subject, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-violet-100 text-violet-700"
              }`}
            >
              {subject}
            </span>
          ))}
        </div>
      ),
    }),

    columnHelper.accessor(
      (row) => ({ name: row.parentName, email: row.parentEmail }),
      {
        id: "parent",
        header: "Parent",
        cell: (info) => (
          <div>
            <div>{info.getValue().name}</div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {info.getValue().email}
            </div>
          </div>
        ),
      }
    ),
    columnHelper.accessor("classTeacher", {
      header: "Class Teacher",
      cell: (info) => {
        const teacher = info.getValue();
        return teacher ? (
          <div>
            <div>{teacher.fullName}</div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {teacher.email}
            </div>
          </div>
        ) : (
          <span
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Not Assigned
          </span>
        );
      },
    }),
    columnHelper.accessor("subjectTeachers", {
      header: "Subject Teachers",
      cell: (info) => {
        const teachers = info.getValue();
        return teachers && teachers.length > 0 ? (
          <div className="space-y-2">
            {teachers.map((st, idx) => (
              <div key={idx}>
                <div
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {st.subject}:
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {st.teacher.fullName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No subject teachers assigned
          </span>
        );
      },
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: (info) => (
        <button
          onClick={() => setSelectedStudent(info.row.original)}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode
              ? "bg-violet-600 hover:bg-violet-700 text-white"
              : "bg-violet-100 hover:bg-violet-200 text-violet-700"
          } text-sm font-medium transition-colors`}
        >
          Assign Teachers
        </button>
      ),
    }),
  ];

  return (
    <>
      <DataTable data={studentList} columns={columns} isDarkMode={isDarkMode} />
      {selectedStudent && (
        <AssignTeachersModal
          student={selectedStudent}
          onClose={(updatedStudent?: Student) => {
            if (updatedStudent) {
              handleTeacherAssignment(updatedStudent);
            } else {
              setSelectedStudent(null);
            }
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
}
