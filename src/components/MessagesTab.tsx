import React, { useState, useEffect } from 'react';
import { MessageList } from './messaging/MessageList';
import { ComposeMessage } from './messaging/ComposeMessage';
import { MessageDialog } from './messaging/MessageDialog';
import { messages } from '../lib/api';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface MessagesTabProps {
  isDarkMode: boolean;
  userRole: 'admin' | 'teacher' | 'parent';
}

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'class' | 'announcement';
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

export function MessagesTab({ isDarkMode, userRole }: MessagesTabProps) {
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const currentUserId = localStorage.getItem('userId') || '';

  const fetchMessages = async () => {
    try {
      const response = await messages.getAll();
      setMessagesList(response.data.messages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMessageClick = async (message: Message) => {
    try {
      // Mark message as read if not sender
      if (message.sender.id !== currentUserId) {
        await messages.markAsRead(message.id);
      }
      setSelectedMessage(message);
    } catch (err: any) {
      console.error('Error marking message as read:', err);
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
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Messages
        </h2>
        {userRole !== 'parent' && (
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Compose Message
          </button>
        )}
      </div>

      <MessageList
        messages={messagesList}
        isDarkMode={isDarkMode}
        currentUserId={currentUserId}
        onMessageClick={handleMessageClick}
      />

      {showCompose && userRole !== 'parent' && (
        <ComposeMessage
          isDarkMode={isDarkMode}
          onClose={() => setShowCompose(false)}
          onSuccess={() => {
            setShowCompose(false);
            fetchMessages();
          }}
          userRole={userRole as 'admin' | 'teacher'}
        />
      )}

      {selectedMessage && (
        <MessageDialog
          message={selectedMessage}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}