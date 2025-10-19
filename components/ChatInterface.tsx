import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType, AnalysisResult } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon, LoadingSpinner } from './IconComponents';
import { getTradeAnalysis } from '../services/openaiService';
import { useSharedState } from '../contexts/SharedStateContext';

interface ChatInterfaceProps { }

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: '1', sender: 'ai', text: 'Welcome to PORTUS AI. How can I help you analyze the global trade network today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('English');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { setCurrentAnalysis } = useSharedState();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simple language detection
  const detectLanguage = (text: string): string => {
    const chinesePattern = /[\u4e00-\u9fff]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7af]/;
    const arabicPattern = /[\u0600-\u06ff]/;
    const cyrillicPattern = /[\u0400-\u04ff]/;
    const thaiPattern = /[\u0e00-\u0e7f]/;

    if (chinesePattern.test(text)) return 'Chinese';
    if (japanesePattern.test(text)) return 'Japanese';
    if (koreanPattern.test(text)) return 'Korean';
    if (arabicPattern.test(text)) return 'Arabic';
    if (cyrillicPattern.test(text)) return 'Russian';
    if (thaiPattern.test(text)) return 'Thai';

    const lowerText = text.toLowerCase();
    const spanishWords = ['hola', 'gracias', 'por favor', 'buenos días', 'cómo', 'está'];
    const frenchWords = ['bonjour', 'merci', 's\'il vous plaît', 'comment', 'allez-vous'];
    const germanWords = ['hallo', 'danke', 'bitte', 'wie', 'geht es'];
    const italianWords = ['ciao', 'grazie', 'per favore', 'come', 'stai'];
    const portugueseWords = ['olá', 'obrigado', 'por favor', 'como', 'está'];

    if (spanishWords.some(word => lowerText.includes(word))) return 'Spanish';
    if (frenchWords.some(word => lowerText.includes(word))) return 'French';
    if (germanWords.some(word => lowerText.includes(word))) return 'German';
    if (italianWords.some(word => lowerText.includes(word))) return 'Italian';
    if (portugueseWords.some(word => lowerText.includes(word))) return 'Portuguese';

    return 'English';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Detect language
    const language = detectLanguage(input.trim());
    setDetectedLanguage(language);

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
      });

      const analysisPromise = getTradeAnalysis(userMessage.text);

      const analysisResult = await Promise.race([analysisPromise, timeoutPromise]);

      console.log("Analysis result received:", analysisResult);

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: analysisResult.explain,
        analysis: analysisResult,
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentAnalysis(analysisResult);

      console.log("Analysis set in shared state");
    } catch (error) {
      console.error("Failed to get analysis:", error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: error instanceof Error && error.message === 'Request timeout'
          ? 'Request timed out. Please try again with a shorter query.'
          : 'Sorry, I encountered an error trying to process your request. Please try again.',
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
        {/* Language Indicator */}
        {detectedLanguage !== 'English' && (
          <div className="mb-2 text-xs text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            Detected: {detectedLanguage} - I'll respond in {detectedLanguage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trade disruptions, vessels, or ports... (Supports multiple languages)"
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