
import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { UserIcon, AiIcon } from './IconComponents';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <AiIcon />
        </div>
      )}
      <div className={`max-w-xl p-4 rounded-2xl ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
