import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  Reply,
  ReplyAll,
  Forward,
  Star,
  Archive,
  Trash2,
  Mail,
  Sparkles,
  Bot,
  ListTodo,
  Calendar,
  HelpCircle,
  Clock,
  CheckCircle,
  Copy,
  Send,
  Loader2,
  ChevronDown,
  Layers,
  ArrowLeft,
  MoreVertical,
  Printer,
  Tag,
} from 'lucide-react';
import { useMailStore } from '../../store/mailStore';
import AISummaryCard from '../ai/AISummaryCard';
import AIReplyGenerator from '../ai/AIReplyGenerator';
import ExplainEmailModal from '../ai/ExplainEmailModal';
import ActionItemsList from '../ai/ActionItemsList';
import DeadlinesList from '../ai/DeadlinesList';

export default function EmailViewer() {
  const {
    selectedMessage,
    selectedThread,
    isLoadingMessageDetail,
    toggleStar,
    toggleRead,
    archiveMessage,
    deleteMessage,
    openCompose,
    activeAITab,
    setActiveAITab,
    generateAISummary,
    generateAIReply,
    explainEmail,
    extractActions,
    extractDates,
  } = useMailStore();

  if (!selectedMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#ffffff]">
        <div className="w-16 h-16 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[#5f6368] mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h3 className="text-base font-medium text-[#202124] mb-1 font-['Google_Sans',sans-serif]">
          Select an item to read
        </h3>
        <p className="text-xs text-[#5f6368] max-w-sm">
          Click any message from your mailbox to view its full conversation and use AI assistance.
        </p>
      </div>
    );
  }

  const sanitizedBody = DOMPurify.sanitize(selectedMessage.body || `<p>${selectedMessage.snippet}</p>`, {
    USE_PROFILES: { html: true },
  });

  const handleReply = () => {
    openCompose({
      to: selectedMessage.from?.email || '',
      subject: selectedMessage.subject.startsWith('Re:')
        ? selectedMessage.subject
        : `Re: ${selectedMessage.subject}`,
      threadId: selectedMessage.threadId || selectedMessage.id,
    });
  };

  const handleReplyAll = () => {
    const toList = [selectedMessage.from?.email].filter(Boolean);
    const ccList = (selectedMessage.cc || []).map((c) => c.email || c).filter(Boolean);
    openCompose({
      to: toList.join(', '),
      cc: ccList.join(', '),
      subject: selectedMessage.subject.startsWith('Re:')
        ? selectedMessage.subject
        : `Re: ${selectedMessage.subject}`,
      threadId: selectedMessage.threadId || selectedMessage.id,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
      {/* Top Gmail Action Toolbar */}
      <div className="h-12 border-b border-[#f1f3f4] px-4 flex items-center justify-between bg-[#ffffff] shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => archiveMessage(selectedMessage.id)}
            title="Archive"
            className="p-2 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteMessage(selectedMessage.id)}
            title="Delete"
            className="p-2 rounded-full text-[#444746] hover:text-[#d93025] hover:bg-[#f1f3f4] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleRead(selectedMessage.id, !selectedMessage.isRead)}
            title={selectedMessage.isRead ? 'Mark unread' : 'Mark read'}
            className="p-2 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleStar(selectedMessage.id)}
            title={selectedMessage.isStarred ? 'Starred' : 'Not starred'}
            className="p-2 rounded-full text-[#444746] hover:text-[#fbbc04] hover:bg-[#f1f3f4] transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                selectedMessage.isStarred ? 'fill-[#fbbc04] text-[#fbbc04]' : 'text-[#444746]'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReply}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f1f3f4] hover:bg-[#e0e2ec] text-[#1f1f1f] flex items-center gap-1.5 transition-colors"
          >
            <Reply className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Split between Gmail Message Body and Google Gemini AI Companion */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Gmail Email Message View */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#ffffff]">
          {/* Email Subject Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {selectedMessage.aiPriority === 'High' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#fce8e6] text-[#c5221f]">
                  Important
                </span>
              )}
              {selectedMessage.aiCategory && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#f1f3f4] text-[#444746] font-medium">
                  {selectedMessage.aiCategory}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-normal text-[#1f1f1f] tracking-tight font-['Google_Sans',sans-serif]">
              {selectedMessage.subject || '(No Subject)'}
            </h1>
          </div>

          {/* Sender & Recipient Bar */}
          <div className="flex items-start justify-between pb-5 mb-5 border-b border-[#f1f3f4]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-medium text-sm shadow-sm">
                {selectedMessage.from?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#202124]">{selectedMessage.from?.name}</p>
                  <span className="text-xs text-[#5f6368]">
                    &lt;{selectedMessage.from?.email}&gt;
                  </span>
                </div>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  to {selectedMessage.to?.map((t) => t.name || t.email).join(', ') || 'me'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#5f6368]">
                {new Date(selectedMessage.date).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Email Body */}
          <div
            className="email-rendered-content max-w-none text-sm text-[#202124] leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />

          {/* Quick Reply / Forward Buttons at Bottom */}
          <div className="mt-8 pt-6 border-t border-[#f1f3f4] flex items-center gap-3">
            <button
              onClick={handleReply}
              className="px-5 py-2 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-2 transition-colors"
            >
              <Reply className="w-4 h-4 text-[#0b57d0]" />
              <span>Reply</span>
            </button>
            <button
              onClick={handleReplyAll}
              className="px-5 py-2 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-2 transition-colors"
            >
              <ReplyAll className="w-4 h-4 text-[#0b57d0]" />
              <span>Reply all</span>
            </button>
            <button
              onClick={handleReply}
              className="px-5 py-2 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-2 transition-colors"
            >
              <Forward className="w-4 h-4 text-[#0b57d0]" />
              <span>Forward</span>
            </button>
          </div>

          {/* Thread messages if multi-message conversation */}
          {selectedThread && selectedThread.length > 1 && (
            <div className="mt-8 pt-6 border-t border-[#f1f3f4]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#0b57d0]" />
                <span>Conversation Thread ({selectedThread.length} messages)</span>
              </h4>
              <div className="space-y-3">
                {selectedThread.map((threadMsg, idx) => (
                  <div
                    key={threadMsg.id || idx}
                    className="p-3.5 rounded-2xl bg-[#f8fafd] border border-[#dadce0] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#202124]">{threadMsg.from?.name || threadMsg.from?.email}</span>
                      <span className="text-[10px] text-[#5f6368] font-mono">{threadMsg.date}</span>
                    </div>
                    <p className="text-[#5f6368] line-clamp-2">{threadMsg.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Google Gemini AI Companion Panel */}
        <div className="w-80 lg:w-96 border-l border-[#e0e2ec] bg-[#ffffff] flex flex-col shrink-0">
          {/* Gemini AI Header */}
          <div className="p-3 border-b border-[#f1f3f4] flex items-center gap-2 bg-[#f8fafd]">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" />
            <span className="text-xs font-medium font-['Google_Sans',sans-serif] text-[#1f1f1f]">
              Gemini AI in IntelliMail
            </span>
          </div>

          {/* Gemini Tabs */}
          <div className="p-1.5 border-b border-[#f1f3f4] grid grid-cols-5 gap-1 bg-[#ffffff]">
            <button
              onClick={() => {
                setActiveAITab('summary');
                generateAISummary();
              }}
              className={`p-1.5 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeAITab === 'summary'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>

            <button
              onClick={() => {
                setActiveAITab('reply');
                generateAIReply();
              }}
              className={`p-1.5 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeAITab === 'reply'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>

            <button
              onClick={() => {
                setActiveAITab('explain');
                explainEmail();
              }}
              className={`p-1.5 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeAITab === 'explain'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Explain</span>
            </button>

            <button
              onClick={() => {
                setActiveAITab('actions');
                extractActions();
              }}
              className={`p-1.5 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeAITab === 'actions'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => {
                setActiveAITab('dates');
                extractDates();
              }}
              className={`p-1.5 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeAITab === 'dates'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Dates</span>
            </button>
          </div>

          {/* AI Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#f8fafd]">
            {activeAITab === 'summary' && <AISummaryCard />}
            {activeAITab === 'reply' && <AIReplyGenerator onInsert={(text) => openCompose({ body: text, threadId: selectedMessage.threadId })} />}
            {activeAITab === 'explain' && <ExplainEmailModal />}
            {activeAITab === 'actions' && <ActionItemsList />}
            {activeAITab === 'dates' && <DeadlinesList />}
          </div>
        </div>
      </div>
    </div>
  );
}
