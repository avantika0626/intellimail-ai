import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  Trash2,
  PenSquare,
  Sparkles,
  BarChart3,
  BookOpen,
  Activity,
  Settings,
  Tag,
  Clock,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

export default function Sidebar() {
  const router = useRouter();
  const { folder, setFolder, openCompose, messages } = useMailStore();

  const isInboxRoute = router.pathname === '/dashboard' || router.pathname === '/inbox';

  const unreadCount = messages.filter((m) => !m.isRead && m.labelIds?.includes('INBOX')).length;
  const starredCount = messages.filter((m) => m.isStarred).length;
  const draftsCount = messages.filter((m) => m.labelIds?.includes('DRAFTS')).length;

  const folders = [
    { id: 'INBOX', label: 'Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'STARRED', label: 'Starred', icon: Star, badge: starredCount > 0 ? starredCount : null },
    { id: 'SENT', label: 'Sent', icon: Send, badge: null },
    { id: 'DRAFTS', label: 'Drafts', icon: FileText, badge: draftsCount > 0 ? draftsCount : (folder === 'DRAFTS' && messages.length > 0 ? messages.length : null) },
    { id: 'ARCHIVE', label: 'Archive', icon: Archive, badge: null },
    { id: 'TRASH', label: 'Trash', icon: Trash2, badge: null },
  ];

  const handleFolderClick = (folderId) => {
    if (!isInboxRoute) {
      router.push('/dashboard').then(() => {
        setFolder(folderId);
      });
    } else {
      setFolder(folderId);
    }
  };

  return (
    <aside className="w-64 bg-[#f6f8fc] pr-3 py-3 pl-2 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-4">
        {/* Iconic Google Mail Compose Pill Button */}
        <div className="px-2 mb-3">
          <button
            onClick={() => openCompose()}
            className="h-14 px-6 rounded-2xl bg-[#c2e7ff] hover:bg-[#b3d7ef] text-[#001d35] font-['Google_Sans',sans-serif] font-medium text-sm flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            {/* Google Multicolor Pen/Plus Icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#EA4335" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
              <path fill="#4285F4" d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <span>Compose</span>
          </button>
        </div>

        {/* Mailbox Folders with Signature Gmail Rounded Right Highlight */}
        <div className="space-y-0.5">
          {folders.map((f) => {
            const Icon = f.icon;
            const isActive = isInboxRoute && folder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleFolderClick(f.id)}
                className={`w-full flex items-center justify-between pl-5 pr-4 py-2.5 rounded-r-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#d3e3fd] text-[#041e49] font-bold'
                    : 'text-[#444746] hover:bg-[#eaebef] hover:text-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? f.id === 'INBOX'
                          ? 'text-[#0b57d0]'
                          : f.id === 'STARRED'
                          ? 'text-[#fbbc04]'
                          : 'text-[#041e49]'
                        : f.id === 'STARRED'
                        ? 'text-[#5f6368] hover:text-[#fbbc04]'
                        : 'text-[#5f6368]'
                    }`}
                  />
                  <span>{f.label}</span>
                </div>
                {f.badge && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#041e49] text-white' : 'bg-[#e0e2ec] text-[#444746]'
                    }`}
                  >
                    {f.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Google Workspace Quick Tools */}
        <div className="pt-3 border-t border-[#e0e2ec] space-y-0.5">
          <p className="px-5 text-[11px] font-medium text-[#5f6368] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
            <span>AI Workspace</span>
          </p>

          <Link
            href="/analytics"
            className={`w-full flex items-center gap-4 pl-5 pr-4 py-2 rounded-r-full text-xs font-medium transition-all ${
              router.pathname === '/analytics'
                ? 'bg-[#d3e3fd] text-[#041e49] font-bold'
                : 'text-[#444746] hover:bg-[#eaebef] hover:text-[#1f1f1f]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#1e8e3e]" />
            <span>Email Analytics</span>
          </Link>

          <Link
            href="/templates"
            className={`w-full flex items-center gap-4 pl-5 pr-4 py-2 rounded-r-full text-xs font-medium transition-all ${
              router.pathname === '/templates'
                ? 'bg-[#d3e3fd] text-[#041e49] font-bold'
                : 'text-[#444746] hover:bg-[#eaebef] hover:text-[#1f1f1f]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#ea4335]" />
            <span>Templates</span>
          </Link>

          <Link
            href="/activity"
            className={`w-full flex items-center gap-4 pl-5 pr-4 py-2 rounded-r-full text-xs font-medium transition-all ${
              router.pathname === '/activity'
                ? 'bg-[#d3e3fd] text-[#041e49] font-bold'
                : 'text-[#444746] hover:bg-[#eaebef] hover:text-[#1f1f1f]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#1a73e8]" />
            <span>Activity History</span>
          </Link>
        </div>
      </div>

      {/* Bottom Settings Link */}
      <div className="pt-2 border-t border-[#e0e2ec]">
        <Link
          href="/settings"
          className={`w-full flex items-center gap-4 pl-5 pr-4 py-2 rounded-r-full text-xs font-medium transition-all ${
            router.pathname === '/settings'
              ? 'bg-[#d3e3fd] text-[#041e49] font-bold'
              : 'text-[#444746] hover:bg-[#eaebef] hover:text-[#1f1f1f]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#5f6368]" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
