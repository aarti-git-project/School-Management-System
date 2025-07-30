import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Check, X, AlertCircle } from "lucide-react";
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

interface TeachersTableProps {
  teachers: Teacher[];
  isDarkMode: boolean;
  onStatusUpdate?: () => void;
}

export function TeachersTable({
  teachers,
  isDarkMode,
  onStatusUpdate,
}: TeachersTableProps) {
  const [error, setError] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const columnHelper = createColumnHelper<Teacher>();

  const handleStatusUpdate = async (
    teacherId: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      setError("");
      setIsUpdating(true);

      const token = localStorage.getItem("token");
      await axios.post(
        `/api/admin/teachers/${teacherId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err: any) {
      console.error("Failed to update teacher status:", err);
      setError(err.response?.data?.message || "Failed to update teacher status");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    columnHelper.accessor("fullName", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor(
      (row) => ({
        email: row.email,
        phone: row.phone,
      }),
      {
        id: "contact",
        header: "Contact",
        cell: (info) => {
          const value = info.getValue();
          return (
            <div>
              <div>{value.email}</div>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {value.phone}
              </div>
            </div>
          );
        },
      }
    ),
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
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              colors[status as keyof typeof colors]
            }`}
          >
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const teacher = info.row.original;
        if (teacher.status !== "pending") {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusUpdate(teacher._id, "approved")}
              disabled={isUpdating}
              className={`p-2 bg-green-100 text-green-700 rounded-lg transition-colors ${
                isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-green-200"
              }`}
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStatusUpdate(teacher._id, "rejected")}
              disabled={isUpdating}
              className={`p-2 bg-red-100 text-red-700 rounded-lg transition-colors ${
                isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-red-200"
              }`}
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      <DataTable data={teachers} columns={columns} isDarkMode={isDarkMode} />
    </div>
  );
}