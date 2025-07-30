import React from 'react';
import { FileText, ExternalLink, Upload } from 'lucide-react';

interface AssignmentsTabProps {
  isDarkMode: boolean;
}

export function AssignmentsTab({ isDarkMode }: AssignmentsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Assignments
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage and distribute assignments to your students
        </p>
      </div>

      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-violet-100'}`}>
            <FileText className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Google Drive Folder
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload and manage assignments in our shared Google Drive folder
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="https://drive.google.com/drive/folders/12BNcEWi14_Rp_WL3zkUFEEu2oyGwiXzA?usp=sharing%22"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                : 'bg-violet-100 hover:bg-violet-200 text-violet-700'
            }`}
          >
            <ExternalLink className="w-5 h-5" />
            Open Assignments Folder
          </a>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Guidelines for Uploading Assignments
            </h4>
            <ul className={`list-disc list-inside space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Use clear and descriptive file names (e.g., "Grade5_Math_Fractions_Week3.pdf")</li>
              <li>Include the due date in the assignment document</li>
              <li>Organize files in appropriate grade/subject folders</li>
              <li>Use PDF format for better compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}