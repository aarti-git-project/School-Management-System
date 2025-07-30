import React from 'react';
import { Mail, Clock, Check, Users } from 'lucide-react';
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

interface MessageListProps {
  messages: Message[];
  isDarkMode: boolean;
  currentUserId: string;
  onMessageClick?: (message: Message) => void;
}

export function MessageList({ messages, isDarkMode, currentUserId, onMessageClick }: MessageListProps) {
  const isMessageRead = (message: Message) => {
    return message.readBy.some(r => r.user.id === currentUserId);
  };

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

  if (messages.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
        <div className="w-20 h-20 rounded-full bg-violet-100 text-violet-500 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10" />
        </div>
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No Messages Yet
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Your messages will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          onClick={() => onMessageClick?.(message)}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg 
            ${onMessageClick ? 'cursor-pointer transition-all hover:shadow-xl' : ''} 
            ${!isMessageRead(message) ? 'border-l-4 border-violet-500' : ''}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {message.subject}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                From: {message.sender.fullName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                isDarkMode 
                  ? 'bg-violet-900/50 text-violet-400' 
                  : 'bg-violet-100 text-violet-600'
              }`}>
                {getMessageTypeLabel(message.type, message.grade)}
              </span>
              {isMessageRead(message) && (
                <Check className={`w-5 h-5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-500'
                }`} />
              )}
            </div>
          </div>

          <p className={`mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {message.content}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {message.recipients.length} recipients
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}