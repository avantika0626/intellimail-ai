import React, { useState } from 'react';
import {
  Star,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
  Tag,
  CheckCircle,
  FileEdit,
  Square,
  CheckSquare,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Users,
  Info,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Columns,
} from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function EmailList({ isCompact = false }) {
  const {
    folder,
    messages,
    selectedMessage,
    selectMessage,
    toggleStar,
    toggleRead,
    archiveMessage,
    deleteMessage,
    isLoadingMessages,
    fetchMessages,
    searchQuery,
    viewMode,
    toggleViewMode,
  } = useMailStore();

  const [activeTab, setActiveTab] = useState('primary');

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 60) return `${diffMins || 1}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'High') {
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fce8e6] text-[#c5221f]">High</span>;
    }
    if (priority === 'Medium') {
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fef7e0] text-[#b06000]">Med</span>;
    }
    return null;
  };

  return (
    <div className={`flex-1 flex flex-col h-full select-none bg-[#ffffff] ${isCompact ? 'w-80 md:w-96 border-r border-[#e0e2ec] shrink-0' : 'w-full'}`}>
      {/* Top Google Mail Toolbar */}
      <div className="h-12 px-4 border-b border-[#f1f3f4] flex items-center justify-between bg-[#ffffff] shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchMessages()}
            disabled={isLoadingMessages}
            title="Refresh"
            className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] hover:text-[#1f1f1f] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin text-[#1a73e8]' : ''}`} />
          </button>

          <span className="text-xs font-['Google_Sans',sans-serif] font-medium text-[#444746] capitalize">
            {folder.toLowerCase()}
          </span>

          {searchQuery && (
            <span className="text-xs text-[#0b57d0] bg-[#c2e7ff] px-2 py-0.5 rounded-full font-medium">
              Search: "{searchQuery}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5f6368]">
          <span className="font-mono">{messages.length > 0 ? `1–${messages.length} of ${messages.length}` : '0 of 0'}</span>
          
          <button
            onClick={toggleViewMode}
            title={viewMode === 'split' ? 'Switch to full view' : 'Switch to split-pane view'}
            className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors hidden sm:block"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Gmail Inbox Category Tabs (Only on INBOX) */}
      {folder === 'INBOX' && (
        <div className="flex items-center border-b border-[#f1f3f4] bg-[#ffffff] text-xs font-medium text-[#5f6368]">
          <button
            onClick={() => setActiveTab('primary')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 relative transition-colors ${
              activeTab === 'primary' ? 'text-[#0b57d0] font-bold' : 'hover:bg-[#f8fafd]'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Primary</span>
            {activeTab === 'primary' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b57d0] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 relative transition-colors ${
              activeTab === 'promotions' ? 'text-[#0b57d0] font-bold' : 'hover:bg-[#f8fafd]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promotions</span>
            {activeTab === 'promotions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b57d0] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 relative transition-colors ${
              activeTab === 'social' ? 'text-[#0b57d0] font-bold' : 'hover:bg-[#f8fafd]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Social</span>
            {activeTab === 'social' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b57d0] rounded-t-full" />
            )}
          </button>
        </div>
      )}

      {/* Email List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#f1f3f4]">
        {isLoadingMessages ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1a73e8] mx-auto" />
            <p className="text-xs text-[#5f6368] font-medium">Syncing mailbox...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center space-y-3 my-auto">
            <div className="w-14 h-14 rounded-full bg-[#f1f3f4] flex items-center justify-center mx-auto text-[#5f6368]">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-base font-medium text-[#202124] font-['Google_Sans',sans-serif]">
              {searchQuery ? 'No matching messages' : folder === 'DRAFTS' ? 'No saved drafts' : 'Your inbox is all caught up!'}
            </p>
            <p className="text-xs text-[#5f6368]">
              {searchQuery ? 'Try another keyword or AI search' : folder === 'DRAFTS' ? 'Drafts you save appear here' : 'Enjoy your day!'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelected = selectedMessage?.id === msg.id;
            const isDraft = msg.labelIds?.includes('DRAFTS');

            /* Full-Width Authentic Google Mail Table Row */
            if (!isCompact) {
              return (
                <div
                  key={msg.id}
                  onClick={() => selectMessage(msg.id)}
                  className={`group px-4 py-2.5 cursor-pointer transition-all text-left relative flex items-center gap-3 border-b border-[#f1f3f4] ${
                    isSelected
                      ? 'bg-[#c2e7ff]'
                      : isDraft
                      ? 'bg-[#fff8e1] hover:bg-[#ffecb3]'
                      : msg.isRead
                      ? 'bg-[#ffffff] hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0] hover:bg-[#f2f6fc]'
                      : 'bg-[#f2f6fc] hover:bg-[#eaf1fb]'
                  }`}
                >
                  {/* Star Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(msg.id);
                    }}
                    className="text-[#5f6368] hover:text-[#fbbc04] transition-colors shrink-0"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        msg.isStarred
                          ? 'fill-[#fbbc04] text-[#fbbc04]'
                          : 'text-[#bdc1c6] hover:text-[#fbbc04]'
                      }`}
                    />
                  </button>

                  {/* Sender Column */}
                  <div className="w-48 sm:w-56 shrink-0 flex items-center gap-2 truncate">
                    {!msg.isRead && !isDraft && (
                      <span className="w-2 h-2 rounded-full bg-[#1a73e8] shrink-0" title="Unread" />
                    )}
                    <span
                      className={`text-xs truncate ${
                        msg.isRead ? 'font-normal text-[#444746]' : 'font-bold text-[#1f1f1f]'
                      }`}
                    >
                      {isDraft
                        ? `Draft: ${msg.to?.[0]?.name || msg.to?.[0]?.email || '(No recipient)'}`
                        : msg.from?.name || msg.from?.email || 'Unknown'}
                    </span>
                  </div>

                  {/* Subject + Snippet Inline (Authentic Gmail Style) */}
                  <div className="flex-1 min-w-0 flex items-center gap-2 truncate text-xs">
                    <span
                      className={`truncate shrink-0 ${
                        isDraft
                          ? 'text-[#b06000] font-medium'
                          : msg.isRead
                          ? 'text-[#444746] font-normal'
                          : 'text-[#1f1f1f] font-bold'
                      }`}
                    >
                      {msg.subject || '(No Subject)'}
                    </span>
                    <span className="text-[#5f6368] text-xs font-normal truncate">
                      — {msg.snippet || 'No text preview'}
                    </span>
                  </div>

                  {/* Badges & Date */}
                  <div className="flex items-center gap-2 shrink-0">
                    {msg.aiPriority && getPriorityBadge(msg.aiPriority)}
                    {msg.aiCategory && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e0e2ec] text-[#444746] font-medium hidden md:inline">
                        {msg.aiCategory}
                      </span>
                    )}
                    <span className="text-[11px] text-[#5f6368] font-medium w-16 text-right group-hover:hidden">
                      {formatTime(msg.date)}
                    </span>
                  </div>

                  {/* Floating Action Icons on Hover */}
                  <div className="hidden group-hover:flex items-center gap-1 bg-[#ffffff] shadow-sm rounded-lg p-0.5 border border-[#dadce0] shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveMessage(msg.id);
                      }}
                      className="p-1 rounded hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f]"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                      className="p-1 rounded hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#d93025]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(msg.id, !msg.isRead);
                      }}
                      className="p-1 rounded hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f]"
                      title={msg.isRead ? 'Mark unread' : 'Mark read'}
                    >
                      {msg.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            }

            /* Compact 3-Line Card (Split-Pane Mode) */
            return (
              <div
                key={msg.id}
                onClick={() => selectMessage(msg.id)}
                className={`group p-3 cursor-pointer transition-all text-left relative flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-[#c2e7ff] text-[#001d35]'
                    : isDraft
                    ? 'bg-[#fff8e1] hover:bg-[#ffecb3]'
                    : msg.isRead
                    ? 'bg-[#ffffff] hover:bg-[#f2f6fc]'
                    : 'bg-[#f2f6fc] hover:bg-[#eaf1fb]'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(msg.id);
                  }}
                  className="mt-0.5 text-[#5f6368] hover:text-[#fbbc04] transition-colors shrink-0"
                >
                  <Star
                    className={`w-4 h-4 ${
                      msg.isStarred
                        ? 'fill-[#fbbc04] text-[#fbbc04]'
                        : 'text-[#bdc1c6] hover:text-[#fbbc04]'
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={`text-xs truncate ${
                        msg.isRead ? 'font-normal text-[#444746]' : 'font-bold text-[#1f1f1f]'
                      }`}
                    >
                      {isDraft
                        ? `Draft: ${msg.to?.[0]?.name || msg.to?.[0]?.email || '(No recipient)'}`
                        : msg.from?.name || msg.from?.email || 'Unknown'}
                    </span>
                    <span className="text-[11px] text-[#5f6368] shrink-0">
                      {formatTime(msg.date)}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate mb-0.5 ${
                      isDraft
                        ? 'text-[#b06000] font-medium'
                        : msg.isRead
                        ? 'text-[#444746] font-normal'
                        : 'text-[#1f1f1f] font-bold'
                    }`}
                  >
                    {msg.subject || '(No Subject)'}
                  </p>

                  <p className="text-[11px] text-[#5f6368] truncate leading-tight">
                    {msg.snippet || 'No text preview'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
