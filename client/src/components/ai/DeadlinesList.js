import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function DeadlinesList() {
  const { aiData, aiLoading, extractDates } = useMailStore();
  const dates = aiData.dates || [];
  const isLoading = aiLoading.dates;

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-[#1f1f1f] font-['Google_Sans',sans-serif]">Dates & Deadlines</h3>
        </div>

        <button
          onClick={() => extractDates()}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1a73e8]' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <Calendar className="w-6 h-6 animate-pulse text-[#b06000] mx-auto" />
          <p className="text-xs text-[#5f6368]">Detecting schedule milestones and meetings...</p>
        </div>
      ) : dates.length > 0 ? (
        <div className="space-y-2">
          {dates.map((item, idx) => {
            const isDeadline = item.type === 'deadline';
            const isMeeting = item.type === 'meeting';
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  isDeadline
                    ? 'bg-[#fce8e6] border-[#fad2cf] text-[#202124]'
                    : isMeeting
                    ? 'bg-[#e8f0fe] border-[#c2e7ff] text-[#202124]'
                    : 'bg-[#ffffff] border-[#dadce0] text-[#202124]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    {isDeadline ? (
                      <AlertCircle className="w-3.5 h-3.5 text-[#c5221f]" />
                    ) : isMeeting ? (
                      <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5 text-[#b06000]" />
                    )}
                    <span>{item.date}</span>
                  </span>
                  {item.time && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 font-mono text-[#444746] border border-[#dadce0]">
                      {item.time}
                    </span>
                  )}
                </div>
                <p className="text-[#3c4043]">{item.description}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#5f6368]">
                  <span className="uppercase font-mono tracking-wider">{item.type || 'Milestone'}</span>
                  {item.confidence && <span>Confidence: {item.confidence}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <p className="text-xs text-[#5f6368]">Click below to detect deadlines, dates, and meetings in this email.</p>
          <button
            onClick={() => extractDates()}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-xs font-medium text-white shadow-sm transition-all"
          >
            Extract Deadlines
          </button>
        </div>
      )}
    </div>
  );
}
