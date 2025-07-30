import React from "react";
import { FileText, ExternalLink } from "lucide-react";

interface AssignmentsTabProps {
  isDarkMode: boolean;
}

export function AssignmentsTab({ isDarkMode }: AssignmentsTabProps) {
  const role = localStorage.getItem("role") || "parent"; // fallback if missing

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Assignments
        </h2>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {role === "teacher"
            ? "Access and share assignments with your students"
            : "Access and download assignments for your children"}
        </p>
      </div>

      <div
        className={`p-6 rounded-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`p-3 rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-violet-100"
            }`}
          >
            <FileText
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
              Google Drive Folder
            </h3>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              All assignments are stored in our Google Drive folder
            </p>
          </div>
        </div>

        <a
          href="https://drive.google.com/drive/folders/12BNcEWi14_Rp_WL3zkUFEEu2oyGwiXzA?usp=sharing%22"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-violet-600 hover:bg-violet-700 text-white"
              : "bg-violet-100 hover:bg-violet-200 text-violet-700"
          }`}
        >
          <ExternalLink className="w-5 h-5" />
          Open Assignments Folder
        </a>
      </div>
    </div>
  );
}
