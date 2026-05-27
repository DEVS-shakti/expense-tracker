import React from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Github,
  TrendingUp,
  TrendingDown,
  Info,
  List as ListIcon,
  Maximize,
  Minimize,
  Calculator,
  PieChart,
  Search,
  BarChart3,
} from 'lucide-react';

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (rawDate) => {
  if (!rawDate) return "-";
  const dateObj = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);
  return dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const SummaryCard = ({ data }) => {
  const { total, count, intent, highlightTransaction, highlightLabel, label, isCountMode } = data;
  
  if (highlightTransaction) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          {intent.type === "max" ? <Maximize className="h-4 w-4 text-rose-600" /> : <Minimize className="h-4 w-4 text-rose-600" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">{highlightLabel}</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{formatCurrency(highlightTransaction.amount)}</p>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span className="font-semibold">{highlightTransaction.category}</span>
          <span>{formatDate(highlightTransaction.date)}</span>
        </div>
        {highlightTransaction.description && (
          <p className="mt-1 text-xs text-slate-500 italic border-t border-rose-100 pt-1">"{highlightTransaction.description}"</p>
        )}
      </div>
    );
  }

  // Use slightly different UI if we specifically requested count
  if (isCountMode) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-4 w-4 text-violet-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-700">{label}</span>
        </div>
        <p className="text-3xl font-bold text-slate-900">{count} <span className="text-lg text-slate-500 font-medium">transactions</span></p>
        <div className="mt-2 text-sm text-slate-600 border-t border-violet-200/50 pt-2 flex items-center justify-between">
          <span className="capitalize">{intent.category || "All Categories"}</span>
          <span className="font-medium text-slate-800">{formatCurrency(total)} subtotal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-sky-600" />
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">{label || "Total Spent"}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{formatCurrency(total)}</p>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-600 border-t border-sky-200/50 pt-2">
        <span><span className="font-medium text-slate-800">{count}</span> entries</span>
        <span className="capitalize">{intent.category || "All Categories"}</span>
      </div>
      {intent.keyword && (
         <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 bg-white/50 px-2 py-1 rounded-md w-fit">
           <Search className="h-3 w-3" />
           Searched: "{intent.keyword}"
         </div>
      )}
    </div>
  );
};

const ComparisonCard = ({ data }) => {
  const { currentRange, compareRange, currentTotal, compareTotal, diff, diffPercent, intent } = data;
  const isUp = diff > 0;
  
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
            {currentRange.replace('_', ' ')}
          </p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(currentTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
            {compareRange.replace('_', ' ')}
          </p>
          <p className="text-lg font-medium text-slate-700">{formatCurrency(compareTotal)}</p>
        </div>
      </div>
      
      <div className={`flex items-center justify-between p-3 rounded-xl border ${isUp ? 'bg-rose-100 border-rose-200' : 'bg-emerald-100 border-emerald-200'}`}>
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-full ${isUp ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
           </div>
           <span className={`text-sm font-semibold ${isUp ? 'text-rose-900' : 'text-emerald-900'}`}>
              {isUp ? "Increased" : "Decreased"} by {formatCurrency(Math.abs(diff))}
           </span>
        </div>
        <span className={`text-sm font-bold ${isUp ? 'text-rose-700' : 'text-emerald-700'}`}>
          {isUp ? '+' : ''}{diffPercent}%
        </span>
      </div>
      {intent.category && (
        <p className="mt-3 text-xs font-medium text-center text-amber-800/80 bg-amber-200/40 rounded-full py-1">
          Filtering for {intent.category} spending
        </p>
      )}
    </div>
  );
};

const GroupListCard = ({ data }) => {
  const { groups, totalCount, message, intent } = data;
  
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 flex items-center gap-2">
        <Info className="h-4 w-4" />
        No data found to group.
      </div>
    );
  }

  const maxAmount = Math.max(...groups.map(g => g.amount));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest px-1 mb-2">
        <span className="flex items-center gap-1.5"><PieChart className="h-3.5 w-3.5" /> Group by {intent.groupBy}</span>
        <span>{totalCount} Groups</span>
      </div>
      
      <div className="space-y-2">
        {groups.map((g, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
             <div 
               className="absolute top-0 left-0 h-full bg-slate-100 -z-0"
               style={{ width: `${(g.amount / maxAmount) * 100}%` }}
             />
             <div className="relative z-10 flex items-center justify-between">
               <div>
                  <p className="font-semibold text-slate-900 text-sm">{g.label}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">{g.count} txns</p>
               </div>
               <div className="font-bold text-slate-800 text-sm">
                  {formatCurrency(g.amount)}
               </div>
             </div>
          </div>
        ))}
      </div>
      {message && <p className="text-xs text-slate-500 text-center italic mt-2">{message}</p>}
    </div>
  );
};

const TransactionList = ({ data }) => {
  const { transactions, count, intent } = data;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 flex items-center gap-2">
        <Info className="h-4 w-4" />
        No transactions found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">
        <span>{count > 50 ? 'Showing first 50' : `${count} Entries`}</span>
        <ListIcon className="h-3 w-3" />
      </div>
      {intent.keyword && (
         <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg mb-2">
           <Search className="h-3 w-3" />
           Contains "{intent.keyword}"
         </div>
      )}
      <div className="space-y-2">
        {transactions.map((txn) => (
          <div key={txn.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-sm">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${txn.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {txn.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{txn.category}</p>
                        <p className="text-xs text-slate-500">{formatDate(txn.date)}</p>
                    </div>
                 </div>
                 <div className="font-semibold text-slate-900 text-right">
                    {formatCurrency(txn.amount)}
                 </div>
             </div>
             {txn.description && (
                <p className="text-xs text-slate-600 border-t border-slate-100 pt-2 mt-1 truncate">
                   {txn.description}
                </p>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AnswerCard = ({ message }) => (
  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
    <div className="mb-2 flex items-center gap-2">
      <Info className="h-4 w-4 text-sky-600" />
      <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
        Guide answer
      </span>
    </div>
    <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{message}</p>
  </div>
);

const AnalysisCard = ({ card }) => {
  const metrics = Array.isArray(card?.metrics) ? card.metrics : [];
  const highlights = Array.isArray(card?.highlights) ? card.highlights : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
      <div className="bg-[linear-gradient(135deg,_#0f172a,_#0ea5e9_55%,_#bae6fd)] px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              Chart explanation
            </p>
            <h4 className="mt-2 text-lg font-semibold">{card?.title || "Why this changed"}</h4>
            {card?.subtitle && <p className="mt-1 text-sm text-white/80">{card.subtitle}</p>}
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {metrics.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {metric.label}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="space-y-2">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-sm font-bold text-cyan-700">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {card?.note && (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
            {card.note}
          </p>
        )}
      </div>
    </div>
  );
};

const OverviewCard = ({ data }) => {
  const sections = Array.isArray(data?.sections) ? data.sections : [];

  if (sections.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {data?.title || "Overview"}
        </span>
      </div>
      <div className="grid gap-2">
        {sections.map((section) => (
          <div
            key={`${section.range}-${section.label}`}
            className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{section.label}</p>
              <p className="text-xs text-slate-500">{section.count} expense entries</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{formatCurrency(section.total)}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Spent</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileCard = ({ card, data }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8_55%,_#93c5fd)] px-4 py-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Assistant intro
          </p>
          <h4 className="mt-2 text-lg font-semibold">{card?.title || "Built by Dev Shakti"}</h4>
        </div>
        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
          <Github className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">
        {card?.description ||
          "Created and maintained by DEVS-shakti for tracking expenses, budgets, insights, and shared bills."}
      </p>
    </div>

    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Github className="h-4 w-4 text-slate-700" />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">GitHub</p>
          <a
            href={data?.githubUrl || card?.githubUrl || "https://github.com/DEVS-shakti"}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
          >
            {data?.githubUrl || card?.githubUrl || "https://github.com/DEVS-shakti"}
          </a>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300" />
      </div>
    </div>
  </div>
);

export const AssistantMessage = ({ msg }) => {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 pr-1">
        <div className="max-w-[85%] rounded-[1.2rem] rounded-tr-[4px] bg-slate-900 px-4 py-2.5 text-sm text-white shadow-md">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="w-full max-w-[92%] space-y-2">
        
        {/* Render Text Message if exists */}
        {msg.message && (
          msg.type === "answer" ? (
            <AnswerCard message={msg.message} />
          ) : msg.type === "profile" ? (
            <div className="space-y-3">
              <AnswerCard message={msg.message} />
              <ProfileCard card={msg.card} data={msg.data} />
            </div>
          ) : (
            <div className="rounded-[1.2rem] rounded-tl-[4px] bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700 leading-relaxed shadow-sm">
              {msg.message}
            </div>
          )
        )}

        {/* Render Visual Structured Data */}
        {msg.type === "summary" && msg.data && (
          <SummaryCard data={msg.data} />
        )}

        {msg.type === "overview" && msg.data && (
          <OverviewCard data={msg.data} />
        )}
        
        {msg.type === "comparison" && msg.data && (
          <ComparisonCard data={msg.data} />
        )}

        {msg.card?.kind === "analysis" && (
          <AnalysisCard card={msg.card} />
        )}

        {msg.type === "group" && msg.data && (
          <GroupListCard data={msg.data} />
        )}

        {msg.type === "list" && msg.data && (
          <TransactionList data={msg.data} />
        )}

        {Array.isArray(msg.followUps) && msg.followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {msg.followUps.map((followUp) => (
              <span
                key={followUp}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600"
              >
                {followUp}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
