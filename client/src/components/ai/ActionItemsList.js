import React, { useState, useEffect } from 'react';
import { ListTodo, CheckSquare, Square, Copy, Check, RefreshCw } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function ActionItemsList() {
  const { aiData, aiLoading, extractActions } = useMailStore();
  const rawActions = aiData.actions || [];
  const isLoading = aiLoading.actions;

  const [actions, setActions] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActions(rawActions);
  }, [rawActions]);

  const toggleAction = (idx) => {
    setActions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCopy = () => {
    const text = actions.map((a) => `${a.completed ? '☒' : '☐'} ${a.task}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
            <ListTodo className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-[#1f1f1f] font-['Google_Sans',sans-serif]">Action Items Checklist</h3>
        </div>

        <button
          onClick={() => extractActions()}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1a73e8]' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <ListTodo className="w-6 h-6 animate-pulse text-[#137333] mx-auto" />
          <p className="text-xs text-[#5f6368]">Extracting action items with Gemini...</p>
        </div>
      ) : actions.length > 0 ? (
        <div className="space-y-3">
          <div className="divide-y divide-[#f1f3f4] rounded-2xl bg-[#ffffff] border border-[#dadce0] overflow-hidden shadow-sm">
            {actions.map((act, idx) => (
              <div
                key={act.id || idx}
                onClick={() => toggleAction(idx)}
                className="p-3 flex items-start gap-2.5 cursor-pointer hover:bg-[#f8fafd] transition-colors text-xs"
              >
                <button type="button" className="mt-0.5 text-[#1a73e8] shrink-0">
                  {act.completed ? (
                    <CheckSquare className="w-4 h-4 text-[#137333]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#dadce0]" />
                  )}
                </button>
                <div className="flex-1">
                  <p
                    className={`leading-relaxed ${
                      act.completed ? 'line-through text-[#5f6368]' : 'text-[#202124] font-medium'
                    }`}
                  >
                    {act.task}
                  </p>
                  {act.priority && (
                    <span className="text-[10px] text-[#5f6368] font-mono mt-0.5 inline-block">
                      Priority: {act.priority}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="w-full h-9 rounded-full bg-[#ffffff] border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Tasks'}</span>
          </button>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 rounded-2xl bg-[#ffffff] border border-[#dadce0]">
          <p className="text-xs text-[#5f6368]">Click below to extract an interactive task checklist.</p>
          <button
            onClick={() => extractActions()}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-xs font-medium text-white shadow-sm transition-all"
          >
            Extract Action Items
          </button>
        </div>
      )}
    </div>
  );
}
