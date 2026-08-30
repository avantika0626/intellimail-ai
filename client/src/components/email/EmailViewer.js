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
  ChevronRight,
  ChevronLeft,
  Layers,
  ArrowLeft,
  MoreVertical,
  Printer,
  Tag,
  Maximize2,
  Minimize2,
  Columns,
  Square,
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
    isAiPanelOpen,
    toggleAiPanel,
    setIsAiPanelOpen,
    clearSelectedMessage,
    viewMode,
    toggleViewMode,
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

  const openAiTool = (toolName, executeFn) => {
    setActiveAITab(toolName);
    setIsAiPanelOpen(true);
    if (executeFn) executeFn();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
      {/* Authentic Google Mail Top Action Toolbar */}
      <div className="h-12 border-b border-[#f1f3f4] px-4 flex items-center justify-between bg-[#ffffff] shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Back to Inbox Button (Google Mail Style) */}
          <button
            onClick={clearSelectedMessage}
            title="Back to inbox"
            className="p-2 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors flex items-center gap-1 mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium font-['Google_Sans',sans-serif] hidden sm:inline text-[#444746]">
              Inbox
            </span>
          </button>

          <div className="h-4 w-px bg-[#dadce0] mx-1" />

          <button
            onClick={() => {
              archiveMessage(selectedMessage.id);
              clearSelectedMessage();
            }}
            title="Archive"
            className="p-2 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              deleteMessage(selectedMessage.id);
              clearSelectedMessage();
            }}
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
          {/* View Mode Toggle: Split / Full */}
          <button
            onClick={toggleViewMode}
            title={viewMode === 'split' ? 'Switch to standard full view' : 'Switch to split-pane view'}
            className="p-2 rounded-full text-[#5f6368] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors hidden md:block"
          >
            <Columns className="w-4 h-4" />
          </button>

          <button
            onClick={handleReply}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f1f3f4] hover:bg-[#e0e2ec] text-[#1f1f1f] flex items-center gap-1.5 transition-colors"
          >
            <Reply className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Reply</span>
          </button>

          {/* Gemini AI Side Panel Toggle Button */}
          <button
            onClick={toggleAiPanel}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isAiPanelOpen
                ? 'bg-[#f3e8ff] border-[#d8b4fe] text-[#6b21a8]'
                : 'bg-[#ffffff] border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4]'
            }`}
            title={isAiPanelOpen ? 'Minimize Gemini AI Panel' : 'Expand Gemini AI Panel'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
            <span className="font-['Google_Sans',sans-serif]">
              {isAiPanelOpen ? 'Hide AI' : 'Gemini AI'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Google Mail Reading Surface + Slim Gemini Companion */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center: Spacious Google Mail Reading Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#ffffff]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Email Subject & Category */}
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
            <div className="flex items-start justify-between pb-5 mb-6 border-b border-[#f1f3f4]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-medium text-sm shadow-sm shrink-0">
                  {selectedMessage.from?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#202124]">{selectedMessage.from?.name}</p>
                    <span className="text-xs text-[#5f6368]">
                      &lt;{selectedMessage.from?.email}&gt;
                    </span>
                  </div>
                  <p className="text-xs text-[#5f6368] mt-0.5">
                    to {selectedMessage.to?.map((t) => t.name || t.email).join(', ') || 'me'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
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
              className="email-rendered-content max-w-none text-[15px] text-[#202124] leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />

            {/* Quick Reply / Forward Buttons at Bottom */}
            <div className="mt-10 pt-6 border-t border-[#f1f3f4] flex items-center gap-3">
              <button
                onClick={handleReply}
                className="px-6 py-2.5 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-2 transition-colors"
              >
                <Reply className="w-4 h-4 text-[#0b57d0]" />
                <span>Reply</span>
              </button>
              <button
                onClick={handleReplyAll}
                className="px-6 py-2.5 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-2 transition-colors"
              >
                <ReplyAll className="w-4 h-4 text-[#0b57d0]" />
                <span>Reply all</span>
              </button>
              <button
                onClick={handleReply}
                className="px-6 py-2.5 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-2 transition-colors"
              >
                <Forward className="w-4 h-4 text-[#0b57d0]" />
                <span>Forward</span>
              </button>
            </div>

            {/* Thread messages if multi-message conversation */}
            {selectedThread && selectedThread.length > 1 && (
              <div className="mt-10 pt-6 border-t border-[#f1f3f4]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#0b57d0]" />
                  <span>Conversation Thread ({selectedThread.length} messages)</span>
                </h4>
                <div className="space-y-3">
                  {selectedThread.map((threadMsg, idx) => (
                    <div
                      key={threadMsg.id || idx}
                      className="p-4 rounded-2xl bg-[#f8fafd] border border-[#dadce0] text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[#202124]">{threadMsg.from?.name || threadMsg.from?.email}</span>
                        <span className="text-[10px] text-[#5f6368] font-mono">{threadMsg.date}</span>
                      </div>
                      <p className="text-[#5f6368] line-clamp-3 leading-relaxed">{threadMsg.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Slim Google Gemini AI Companion Panel */}
        {isAiPanelOpen ? (
          <div className="w-64 lg:w-72 border-l border-[#e0e2ec] bg-[#ffffff] flex flex-col shrink-0 transition-all duration-200">
            {/* Gemini AI Header */}
            <div className="p-2.5 px-3 border-b border-[#f1f3f4] flex items-center justify-between bg-[#f8fafd]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                <span className="text-xs font-bold font-['Google_Sans',sans-serif] text-[#1f1f1f]">
                  Gemini AI
                </span>
              </div>

              <button
                onClick={toggleAiPanel}
                className="p-1 rounded-full hover:bg-[#e0e2ec] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
                title="Minimize Gemini AI"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Gemini Tabs */}
            <div className="p-1 border-b border-[#f1f3f4] grid grid-cols-5 gap-1 bg-[#ffffff]">
              <button
                onClick={() => openAiTool('summary', generateAISummary)}
                className={`p-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center gap-0.5 transition-all ${
                  activeAITab === 'summary'
                    ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#f1f3f4]'
                }`}
                title="Summary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sum</span>
              </button>

              <button
                onClick={() => openAiTool('reply', generateAIReply)}
                className={`p-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center gap-0.5 transition-all ${
                  activeAITab === 'reply'
                    ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#f1f3f4]'
                }`}
                title="Reply"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>

              <button
                onClick={() => openAiTool('explain', explainEmail)}
                className={`p-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center gap-0.5 transition-all ${
                  activeAITab === 'explain'
                    ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#f1f3f4]'
                }`}
                title="Explain"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Exp</span>
              </button>

              <button
                onClick={() => openAiTool('actions', extractActions)}
                className={`p-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center gap-0.5 transition-all ${
                  activeAITab === 'actions'
                    ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#f1f3f4]'
                }`}
                title="Tasks"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </button>

              <button
                onClick={() => openAiTool('dates', extractDates)}
                className={`p-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center gap-0.5 transition-all ${
                  activeAITab === 'dates'
                    ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#f1f3f4]'
                }`}
                title="Dates"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dates</span>
              </button>
            </div>

            {/* AI Panel Content */}
            <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar bg-[#f8fafd]">
              {activeAITab === 'summary' && <AISummaryCard />}
              {activeAITab === 'reply' && <AIReplyGenerator onInsert={(text) => openCompose({ body: text, threadId: selectedMessage.threadId })} />}
              {activeAITab === 'explain' && <ExplainEmailModal />}
              {activeAITab === 'actions' && <ActionItemsList />}
              {activeAITab === 'dates' && <DeadlinesList />}
            </div>
          </div>
        ) : (
          /* Collapsed Thin Icon Rail (Google Side Panel Style) */
          <div className="w-12 border-l border-[#e0e2ec] bg-[#f8fafd] flex flex-col items-center py-3 gap-2 shrink-0 transition-all duration-200 select-none">
            <button
              onClick={toggleAiPanel}
              className="p-2 rounded-full bg-[#f3e8ff] hover:bg-[#ebd5ff] text-[#7c3aed] shadow-sm mb-2"
              title="Expand Gemini AI Panel"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAiTool('summary', generateAISummary)}
              className="p-2 rounded-xl text-[#444746] hover:bg-[#e0e2ec] hover:text-[#0b57d0] transition-colors"
              title="AI Summary"
            >
              <Sparkles className="w-4 h-4 text-[#7c3aed]" />
            </button>

            <button
              onClick={() => openAiTool('reply', generateAIReply)}
              className="p-2 rounded-xl text-[#444746] hover:bg-[#e0e2ec] hover:text-[#0b57d0] transition-colors"
              title="Help me Reply"
            >
              <Bot className="w-4 h-4 text-[#0b57d0]" />
            </button>

            <button
              onClick={() => openAiTool('explain', explainEmail)}
              className="p-2 rounded-xl text-[#444746] hover:bg-[#e0e2ec] hover:text-[#0b57d0] transition-colors"
              title="Explain This Email"
            >
              <HelpCircle className="w-4 h-4 text-[#0b57d0]" />
            </button>

            <button
              onClick={() => openAiTool('actions', extractActions)}
              className="p-2 rounded-xl text-[#444746] hover:bg-[#e0e2ec] hover:text-[#137333] transition-colors"
              title="Action Items Checklist"
            >
              <ListTodo className="w-4 h-4 text-[#137333]" />
            </button>

            <button
              onClick={() => openAiTool('dates', extractDates)}
              className="p-2 rounded-xl text-[#444746] hover:bg-[#e0e2ec] hover:text-[#b06000] transition-colors"
              title="Dates & Deadlines"
            >
              <Calendar className="w-4 h-4 text-[#b06000]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
