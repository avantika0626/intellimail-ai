import React, { useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function DailySummaryWidget() {
  const { dailySummaryData, isLoadingDailySummary, fetchDailySummary } = useMailStore();

  useEffect(() => {
    if (!dailySummaryData) {
      fetchDailySummary();
    }
  }, []);

  if (isLoadingDailySummary && !dailySummaryData) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#f8fafd] border border-[#dadce0] animate-pulse text-xs text-[#5f6368] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#7c3aed] animate-spin" />
        <span>Synthesizing Today's Inbox Overview with Gemini AI...</span>
      </div>
    );
  }

  if (!dailySummaryData) return null;

  const { totalNewEmails, priorityBreakdown, topActionItems, healthScore, inboxStatus } = dailySummaryData;

  return (
    <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#dadce0] shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1f1f1f] font-['Google_Sans',sans-serif]">
              Today's Inbox Overview & Priorities
            </h4>
            <p className="text-[11px] text-[#5f6368]">AI briefing on deadlines and critical actions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
            {inboxStatus || 'Healthy'} ({healthScore}% Score)
          </span>
          <button
            onClick={() => fetchDailySummary()}
            disabled={isLoadingDailySummary}
            className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDailySummary ? 'animate-spin text-[#1a73e8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Priority Counts & Top Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Priority breakdown card */}
        <div className="p-3 rounded-xl bg-[#f8fafd] border border-[#e0e2ec] text-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#5f6368] uppercase tracking-wider">Priority Distribution</span>
          <div className="flex items-center justify-around mt-2">
            <div className="text-center">
              <p className="text-base font-bold text-[#c5221f]">{priorityBreakdown?.high || 0}</p>
              <p className="text-[10px] text-[#5f6368]">High</p>
            </div>
            <div className="w-px h-6 bg-[#dadce0]" />
            <div className="text-center">
              <p className="text-base font-bold text-[#b06000]">{priorityBreakdown?.medium || 0}</p>
              <p className="text-[10px] text-[#5f6368]">Medium</p>
            </div>
            <div className="w-px h-6 bg-[#dadce0]" />
            <div className="text-center">
              <p className="text-base font-bold text-[#137333]">{priorityBreakdown?.low || 0}</p>
              <p className="text-[10px] text-[#5f6368]">Low</p>
            </div>
          </div>
        </div>

        {/* Top 2 Urgent Actions */}
        <div className="md:col-span-2 p-3 rounded-xl bg-[#f8fafd] border border-[#e0e2ec] text-xs">
          <span className="text-[11px] font-medium text-[#0b57d0] uppercase tracking-wider block mb-1.5">
            Key Deliverables Today
          </span>
          <div className="space-y-1">
            {topActionItems?.slice(0, 2).map((item, idx) => (
              <p key={idx} className="text-[#202124] flex items-start gap-1.5 truncate text-[12px]">
                <span className="text-[#0b57d0] font-bold">•</span>
                <span className="truncate">{item}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
