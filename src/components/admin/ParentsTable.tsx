import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "./DataTable";

interface Parent {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  childCount: number;
}

interface ParentsTableProps {
  parents: Parent[];
  isDarkMode: boolean;
}

export function ParentsTable({ parents, isDarkMode }: ParentsTableProps) {
  const columnHelper = createColumnHelper<Parent>();

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
    columnHelper.accessor("childCount", {
      header: "Children",
      cell: (info) => (
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            isDarkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {info.getValue()} children
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const badgeClass =
          status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : status === "approved"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
        return (
          <span
            className={`px-3 py-1 text-sm rounded-full capitalize ${badgeClass}`}
          >
            {status}
          </span>
        );
      },
    }),
  ];

  return <DataTable columns={columns} data={parents} isDarkMode={isDarkMode} />;
}