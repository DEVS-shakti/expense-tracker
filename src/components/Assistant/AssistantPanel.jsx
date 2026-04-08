import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, X, RotateCcw } from 'lucide-react';
import { useAssistant } from '../../hooks/useAssistant';
import { AssistantMessage } from './AssistantMessage';

const SUGGESTIONS = [
  "Total this month",
  "Highest travel expense",
  "Compare this week vs last week",
  "Group by category",
  "Average per day",
  "Search pizza"
];

export const AssistantPanel = ({ onClose }) => {
  const { messages, sendMessage, isLoading, isInitializing, clearChat } = useAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isInitializing) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestion = (text) => {
    if (isLoading || isInitializing) return;
    sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full max-w-md ml-auto shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">Smart Assistant</h3>
            <p className="text-xs text-slate-500 font-medium">
              {isInitializing ? "Connecting..." : "Ready to help"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            title="Clear Chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scroll-smooth">
        {messages.map((msg) => (
          <AssistantMessage key={msg.id} msg={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
             <div className="bg-white border border-slate-200 rounded-[1.2rem] rounded-tl-[4px] px-4 py-2.5 shadow-sm text-slate-500 flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                Thinking...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {/* Quick Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar touch-pan-x">
          {SUGGESTIONS.map((sug, i) => (
             <button
                key={i}
                onClick={() => handleSuggestion(sug)}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
             >
                {sug}
             </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isInitializing}
            placeholder={isInitializing ? "Loading user data..." : "Ask me anything..."}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isInitializing}
            className="absolute right-1.5 p-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
