import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Maximize2,
  Minimize2,
  Loader2,
  PiggyBank,
  ReceiptText,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAssistant } from '../../hooks/useAssistant';
import { AssistantMessage } from './AssistantMessage';

const GUIDE_PRESETS = [
  {
    icon: BookOpen,
    title: "How to use",
    description: "Learn the workflow from adding entries to reading insights and balances.",
    prompt: "Explain how to use this website step by step.",
  },
  {
    icon: Sparkles,
    title: "Why use it",
    description: "Understand how it keeps your money data organized and easier to review.",
    prompt: "Why should I use ExpenseTrack instead of tracking expenses manually?",
  },
  {
    icon: TrendingUp,
    title: "Main features",
    description: "See what the dashboard, budgets, insights, and roommate tools do.",
    prompt: "Explain the main features of this website and how each one helps me.",
  },
];

const FINANCE_PRESETS = [
  {
    icon: Wallet,
    label: "Spending summary",
    prompt: "Show my total spending this month and highlight the biggest category.",
  },
  {
    icon: PiggyBank,
    label: "Budget check",
    prompt: "Which budgets am I close to crossing this month?",
  },
  {
    icon: Users,
    label: "Roommate balances",
    prompt: "Show the outstanding roommate balances and who still owes money.",
  },
  {
    icon: ReceiptText,
    label: "Recent expenses",
    prompt: "List my most recent expenses and summarize what I spent on.",
  },
];

const QUICK_PROMPTS = [
  "Total this month",
  "Highest travel expense",
  "Compare this week vs last week",
  "Group by category",
  "Budget check",
  "Roommate balances",
];

const TOUR_STEPS = [
  {
    title: "Dashboard summary",
    prompt: "Give me a quick walkthrough of the dashboard and what I should look at first.",
  },
  {
    title: "Transactions",
    prompt: "Explain how to add, review, and filter my transactions on this website.",
  },
  {
    title: "Insights",
    prompt: "Explain what the insights charts mean and how they help me spot spending changes.",
  },
  {
    title: "Budgets",
    prompt: "Explain how budgets work here and how I can avoid overspending.",
  },
  {
    title: "Roommate splits",
    prompt: "Explain how roommate splits and outstanding balances work in this app.",
  },
];

const EmptyState = ({ onPrompt, onStartTour }) => (
  <div className="mb-4 overflow-hidden rounded-[1.6rem] border border-indigo-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.98))] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
    <div className="border-b border-indigo-100/80 px-5 py-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
        <Sparkles className="h-3.5 w-3.5" />
        Dashboard guide
      </div>
      <h4 className="mt-3 text-xl font-semibold text-slate-900">Ask a question, or start with a guided prompt</h4>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        I can explain how the app works, why it is useful, and how to use each feature.
        I can also answer questions from your Firebase spending, budgets, and roommate data.
      </p>
    </div>

    <div className="grid gap-3 px-5 py-4">
      <div className="grid gap-3 md:grid-cols-3">
        {GUIDE_PRESETS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onPrompt(item.prompt)}
              className="group rounded-[1.3rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </div>
              <h5 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h5>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {FINANCE_PRESETS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onPrompt(item.prompt)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/70"
            >
              <div className="rounded-xl bg-white p-2 text-indigo-600 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">One tap, and I will do the rest.</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.3rem] border border-slate-200 bg-slate-900 px-4 py-4 text-white shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Guided tour
            </p>
            <h5 className="mt-2 text-base font-semibold">Walk through the website in order</h5>
            <p className="mt-1 text-sm leading-6 text-white/75">
              I can guide you through the dashboard, transactions, insights, budgets, and roommate
              splits step by step.
            </p>
          </div>
          <Compass className="h-5 w-5 text-cyan-300" />
        </div>
        <button
          type="button"
          onClick={onStartTour}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Start dashboard tour
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

const TourRail = ({ active, stepIndex, onNext, onEnd, currentStep }) => {
  if (!active) return null;

  return (
    <div className="mb-4 rounded-[1.4rem] border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Dashboard tour
          </p>
          <h4 className="mt-1 text-base font-semibold text-slate-900">
            Step {stepIndex + 1} of {TOUR_STEPS.length}
          </h4>
          <p className="mt-1 text-sm text-slate-600">{currentStep?.title}</p>
        </div>
        <button
          type="button"
          onClick={onEnd}
          className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
        >
          End tour
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TOUR_STEPS.map((step, index) => (
          <span
            key={step.title}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              index === stepIndex
                ? "bg-cyan-600 text-white"
                : index < stepIndex
                  ? "bg-cyan-100 text-cyan-700"
                  : "bg-white text-slate-500"
            }`}
          >
            {index + 1}. {step.title}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm leading-6 text-slate-700">
          {currentStep?.prompt}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex >= TOUR_STEPS.length - 1}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {stepIndex >= TOUR_STEPS.length - 1 ? "Tour complete" : "Next step"}
        </button>
      </div>
    </div>
  );
};

export const AssistantPanel = ({ onClose }) => {
  const { messages, sendMessage, isLoading, isInitializing, clearChat, memory } = useAssistant();
  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const hasConversation = messages.some((msg) => msg.role === 'user');
  const currentTourStep = TOUR_STEPS[tourStepIndex] || null;

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isFullscreen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

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

  const handleClearChat = () => {
    clearChat();
    setTourActive(false);
    setTourStepIndex(0);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((current) => !current);
  };

  const handleStartTour = () => {
    if (isLoading || isInitializing) return;
    setTourActive(true);
    setTourStepIndex(0);
    sendMessage(TOUR_STEPS[0].prompt);
  };

  const handleNextTourStep = () => {
    if (tourStepIndex >= TOUR_STEPS.length - 1 || isLoading || isInitializing) {
      if (tourStepIndex >= TOUR_STEPS.length - 1) setTourActive(false);
      return;
    }

    const nextStepIndex = tourStepIndex + 1;
    setTourStepIndex(nextStepIndex);
    sendMessage(TOUR_STEPS[nextStepIndex].prompt);
  };

  const handleEndTour = () => {
    setTourActive(false);
    setTourStepIndex(0);
  };

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden bg-slate-50 shadow-2xl relative ${
        isFullscreen ? "fixed inset-0 z-[90] rounded-none" : "max-w-[min(100vw,40rem)]"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-[linear-gradient(135deg,_#ffffff,_#f8fbff_55%,_#eef4ff)] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-indigo-100 p-2 text-indigo-600 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">Smart Assistant</h3>
            <p className="text-xs text-slate-500 font-medium">
              {isInitializing
                ? "Connecting to your Firebase data..."
                : "Your dashboard guide and finance copilot"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Tone: {memory?.tone || "friendly"} | Memory:{" "}
              {Array.isArray(memory?.lastTopics) && memory.lastTopics.length > 0
                ? memory.lastTopics.join(", ")
                : "fresh"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            title="Clear Chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
        <TourRail
          active={tourActive}
          stepIndex={tourStepIndex}
          currentStep={currentTourStep}
          onNext={handleNextTourStep}
          onEnd={handleEndTour}
        />

        {!hasConversation && (
          <EmptyState onPrompt={handleSuggestion} onStartTour={handleStartTour} />
        )}

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
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Ask a question
          </p>
          <p className="text-xs text-slate-500">
            Try guide prompts or your own question
          </p>
        </div>

        {/* Quick Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar touch-pan-x">
          {QUICK_PROMPTS.map((sug) => (
             <button
                key={sug}
                onClick={() => handleSuggestion(sug)}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
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
            placeholder={isInitializing ? "Loading your data..." : "Ask about the app or your finances..."}
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
