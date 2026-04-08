import React from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Info, List as ListIcon, Maximize, Minimize, Calculator, CalendarIcon, PieChart, Search } from 'lucide-react';

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
          <div className="rounded-[1.2rem] rounded-tl-[4px] bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700 leading-relaxed shadow-sm">
            {msg.message}
          </div>
        )}

        {/* Render Visual Structured Data */}
        {msg.type === "summary" && msg.data && (
          <SummaryCard data={msg.data} />
        )}
        
        {msg.type === "comparison" && msg.data && (
          <ComparisonCard data={msg.data} />
        )}

        {msg.type === "group" && msg.data && (
          <GroupListCard data={msg.data} />
        )}

        {msg.type === "list" && msg.data && (
          <TransactionList data={msg.data} />
        )}
      </div>
    </div>
  );
};
