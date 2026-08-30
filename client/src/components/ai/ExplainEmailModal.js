import React from 'react';
import { HelpCircle, Clock, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function ExplainEmailModal() {
  const { aiData, aiLoading, explainEmail } = useMailStore();
  const explainData = aiData.explain;
  const isLoading = aiLoading.explain;

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-[#1f1f1f] font-['Google_Sans',sans-serif]">Explain This Email</h3>
        </div>

        <button
          onClick={() => explainEmail()}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1a73e8]' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <HelpCircle className="w-6 h-6 animate-pulse text-[#7c3aed] mx-auto" />
          <p className="text-xs text-[#5f6368]">Simplifying technical/formal email context...</p>
        </div>
      ) : explainData ? (
        <div className="space-y-3 text-xs">
          {/* What This Means */}
          <div className="p-3.5 rounded-2xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <p className="font-medium text-[#7c3aed] mb-1.5 flex items-center gap-1.5 font-['Google_Sans',sans-serif]">
              <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>WHAT THIS MEANS</span>
            </p>
            <p className="text-[#202124] leading-relaxed">{explainData.whatThisMeans}</p>
          </div>

          {/* What You Need to Do */}
          <div className="p-3.5 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
            <p className="font-medium text-[#0b57d0] mb-2 flex items-center gap-1.5 font-['Google_Sans',sans-serif]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0b57d0]" />
              <span>ACTION STEPS FOR YOU</span>
            </p>
            <ul className="space-y-2">
              {explainData.whatYouNeedToDo?.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[#202124]">
                  <span className="w-4 h-4 rounded-full bg-[#c2e7ff] text-[#001d35] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deadline Callout */}
          <div className="p-3.5 rounded-2xl bg-[#fef7e0] border border-[#fce8b2]">
            <p className="font-medium text-[#b06000] mb-1 flex items-center gap-1.5 font-['Google_Sans',sans-serif]">
              <Clock className="w-3.5 h-3.5 text-[#b06000]" />
              <span>DEADLINE & TIMEFRAME</span>
            </p>
            <p className="text-[#202124] font-medium">{explainData.deadline}</p>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <p className="text-xs text-[#5f6368]">Click below to get a plain-English explanation of this message.</p>
          <button
            onClick={() => explainEmail()}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-xs font-medium text-white shadow-sm transition-all"
          >
            Explain Email
          </button>
        </div>
      )}
    </div>
  );
}
