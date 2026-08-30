import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Send, Copy, Check, RefreshCw, PenTool, Edit3, ArrowRight } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

const TONES = [
  { id: 'Professional', label: 'Professional', emoji: '💼' },
  { id: 'Friendly', label: 'Friendly', emoji: '😊' },
  { id: 'Formal', label: 'Formal', emoji: '🏛️' },
  { id: 'Concise', label: 'Concise', emoji: '⚡' },
  { id: 'Apologetic', label: 'Apologetic', emoji: '🙏' },
  { id: 'Confident', label: 'Confident', emoji: '🚀' },
];

export default function AIReplyGenerator({ onInsert }) {
  const { aiData, aiLoading, generateAIReply, openCompose, selectedMessage } = useMailStore();
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [instructions, setInstructions] = useState('');
  const [editableDraft, setEditableDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const replyData = aiData.reply;
  const isLoading = aiLoading.reply;

  useEffect(() => {
    if (replyData?.replyText) {
      setEditableDraft(replyData.replyText);
    }
  }, [replyData]);

  const handleGenerate = (tone = selectedTone) => {
    setSelectedTone(tone);
    generateAIReply(tone, instructions);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsert) {
      onInsert(editableDraft);
    } else {
      openCompose({
        to: selectedMessage?.from?.email || '',
        subject: selectedMessage?.subject?.startsWith('Re:')
          ? selectedMessage?.subject
          : `Re: ${selectedMessage?.subject}`,
        body: editableDraft,
        threadId: selectedMessage?.threadId || selectedMessage?.id,
      });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-[#1f1f1f] font-['Google_Sans',sans-serif]">Help Me Reply</h3>
        </div>

        <button
          onClick={() => handleGenerate(selectedTone)}
          disabled={isLoading}
          title="Regenerate reply"
          className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1a73e8]' : ''}`} />
        </button>
      </div>

      {/* Tone Picker Grid */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-[#5f6368] uppercase tracking-wider">Select Response Tone</label>
        <div className="grid grid-cols-3 gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleGenerate(t.id)}
              className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                selectedTone === t.id
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold border border-[#7fcfff]'
                  : 'bg-[#ffffff] border border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Custom Instructions */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-[#5f6368] uppercase tracking-wider">
          Custom Prompt (Optional)
        </label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Confirm meeting on Friday, ask for slides..."
          className="w-full h-8 px-3 rounded-xl bg-[#ffffff] border border-[#dadce0] text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8]"
        />
      </div>

      {/* Reply Output Draft (Editable) */}
      {isLoading ? (
        <div className="p-8 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <Bot className="w-6 h-6 animate-pulse text-[#7c3aed] mx-auto" />
          <p className="text-xs text-[#5f6368]">Crafting {selectedTone.toLowerCase()} response draft...</p>
        </div>
      ) : editableDraft ? (
        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-t-xl bg-[#f2f6fc] border border-b-0 border-[#dadce0] text-[11px] font-medium text-[#444746]">
              <span className="flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-[#1a73e8]" />
                <span>Editable Draft ({selectedTone})</span>
              </span>
              <span className="text-[10px] text-[#1e8e3e] font-medium">User controlled</span>
            </div>
            <textarea
              rows={8}
              value={editableDraft}
              onChange={(e) => setEditableDraft(e.target.value)}
              className="w-full p-3 rounded-b-xl bg-[#ffffff] border border-[#dadce0] text-xs text-[#202124] leading-relaxed font-sans focus:outline-none focus:border-[#1a73e8] custom-scrollbar resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="h-9 rounded-full bg-[#ffffff] border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleInsert}
              className="h-9 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-xs font-medium text-white flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Insert & Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <p className="text-xs text-[#5f6368]">Click a tone above to generate an email response draft.</p>
          <button
            onClick={() => handleGenerate('Professional')}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-xs font-medium text-white shadow-sm transition-all"
          >
            Generate Reply
          </button>
        </div>
      )}
    </div>
  );
}
