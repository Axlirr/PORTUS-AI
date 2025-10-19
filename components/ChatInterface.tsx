import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType, AnalysisResult } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon, LoadingSpinner } from './IconComponents';
import { getTradeAnalysis } from '../services/openaiService';

interface ChatInterfaceProps {
  onAnalysisReceived: (analysis: AnalysisResult) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAnalysisReceived }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: '1', sender: 'ai', text: 'Welcome to PORTUS AI. How can I help you analyze the global trade network today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const analysisResult = await getTradeAnalysis(userMessage.text);

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: analysisResult.explain,
        analysis: analysisResult,
      };
      setMessages(prev => [...prev, aiMessage]);
      onAnalysisReceived(analysisResult);
    } catch (error) {
      console.error("Failed to get analysis:", error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error trying to process your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/60 rounded-2xl border border-gray-700 backdrop-blur-sm">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><LoadingSpinner /></div>
            <div className="max-w-xl p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
              <p className="text-sm italic text-gray-400">Analyzing...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trade disruptions, vessels, or ports..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors duration-200 flex items-center justify-center w-10 h-10"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;