import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, ListCheck, FileText, CheckCircle } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function AISummaryCard() {
  const { aiData, aiLoading, generateAISummary } = useMailStore();
  const [length, setLength] = useState('concise');
  const [copied, setCopied] = useState(false);

  const summaryData = aiData.summary;
  const isLoading = aiLoading.summary;

  const handleCopy = () => {
    if (!summaryData) return;
    const text = `SUMMARY:\n${summaryData.summary}\n\nKEY POINTS:\n${summaryData.keyPoints?.map((k) => `• ${k}`).join('\n')}\n\nACTION REQUIRED:\n${summaryData.actionRequired?.map((a) => `• ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLengthChange = (newLen) => {
    setLength(newLen);
    generateAISummary(newLen);
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-[#1f1f1f] font-['Google_Sans',sans-serif]">Executive Summary</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleLengthChange(length === 'concise' ? 'detailed' : 'concise')}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#ffffff] border border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4] transition-colors uppercase"
          >
            {length}
          </button>
          <button
            onClick={() => generateAISummary(length)}
            disabled={isLoading}
            className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1a73e8]' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <Sparkles className="w-6 h-6 animate-pulse text-[#7c3aed] mx-auto" />
          <p className="text-xs text-[#5f6368]">Synthesizing email with Gemini...</p>
        </div>
      ) : summaryData ? (
        <div className="space-y-3">
          {/* Executive Summary Paragraph */}
          <div className="p-3.5 rounded-2xl bg-[#ffffff] border border-[#dadce0] shadow-sm text-xs leading-relaxed text-[#202124]">
            <p className="font-medium text-[#0b57d0] mb-1 flex items-center gap-1.5 font-['Google_Sans',sans-serif]">
              <FileText className="w-3.5 h-3.5" />
              <span>Core Takeaway</span>
            </p>
            <p>{summaryData.summary}</p>
          </div>

          {/* Key Points */}
          {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#ffffff] border border-[#dadce0] text-xs">
              <p className="font-medium text-[#1f1f1f] mb-2 flex items-center gap-1.5 font-['Google_Sans',sans-serif]">
                <ListCheck className="w-3.5 h-3.5 text-[#1e8e3e]" />
                <span>Key Points</span>
              </p>
              <ul className="space-y-1.5">
                {summaryData.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-[#3c4043] flex items-start gap-2">
                    <span className="text-[#1a73e8] font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Required */}
          {summaryData.actionRequired && summaryData.actionRequired.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#fef7e0] border border-[#fce8b2] text-xs">
              <p className="font-medium text-[#b06000] mb-2 flex items-center gap-1.5 font-['Google_Sans',sans-serif]">
                <CheckCircle className="w-3.5 h-3.5 text-[#b06000]" />
                <span>Action Required</span>
              </p>
              <ul className="space-y-1.5">
                {summaryData.actionRequired.map((action, idx) => (
                  <li key={idx} className="text-[#202124] flex items-start gap-2">
                    <span className="text-[#b06000] font-bold">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full h-9 rounded-full bg-[#ffffff] border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <p className="text-xs text-[#5f6368]">Click below to generate a Gemini summary of this email.</p>
          <button
            onClick={() => generateAISummary(length)}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-xs font-medium text-white shadow-sm transition-all"
          >
            Generate Summary
          </button>
        </div>
      )}
    </div>
  );
}
