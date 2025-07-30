import React from 'react';
import { X, Mail, Clock, Users, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'individual' | 'class' | 'announcement';
  grade?: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  recipients: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  }>;
  readBy: Array<{
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
    };
    readAt: string;
  }>;
  createdAt: string;
}

interface MessageDialogProps {
  message: Message;
  isDarkMode: boolean;
  onClose: () => void;
}

export function MessageDialog({ message, isDarkMode, onClose }: MessageDialogProps) {
  const getMessageTypeLabel = (type: Message['type'], grade?: string) => {
    switch (type) {
      case 'individual':
        return 'Direct Message';
      case 'class':
        return `Class Message - ${grade}`;
      case 'announcement':
        return 'Announcement';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm mb-2 ${
              isDarkMode 
                ? 'bg-violet-900/50 text-violet-400' 
                : 'bg-violet-100 text-violet-600'
            }`}>
              {getMessageTypeLabel(message.type, message.grade)}
            </span>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {message.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sender Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-violet-50'}`}>
            <div className="flex items-center gap-3">
              <Mail className={`w-5 h-5 ${
                isDarkMode ? 'text-violet-400' : 'text-violet-600'
              }`} />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  From: {message.sender.fullName}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {message.sender.email} • {message.sender.role}
                </p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
            {message.content}
          </div>

          {/* Recipients and Read Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Recipients ({message.recipients.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {message.recipients.map(recipient => (
                  <div key={recipient.id} className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {recipient.fullName}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {recipient.role}
                      </p>
                    </div>
                    {message.readBy.some(r => r.user.id === recipient.id) && (
                      <Check className={`w-5 h-5 ${
                        isDarkMode ? 'text-green-400' : 'text-green-500'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}