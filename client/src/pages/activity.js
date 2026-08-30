import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/layout/AppShell';
import {
  Activity as ActivityIcon,
  Sparkles,
  Send,
  Trash2,
  Archive,
  Star,
  RefreshCw,
  Clock,
  CheckCircle,
  FileEdit,
} from 'lucide-react';
import api from '../services/api';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = () => {
    setIsLoading(true);
    api.get('/activity')
      .then((res) => {
        if (res.data.success) {
          setActivities(res.data.data);
        }
      })
      .catch((err) => console.error('Activity fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const getActionIcon = (type) => {
    switch (type) {
      case 'EMAIL_SENT':
        return <Send className="w-4 h-4 text-[#1e8e3e]" />;
      case 'AI_SUMMARY_GENERATED':
      case 'AI_REPLY_GENERATED':
      case 'AI_EXPLAIN_GENERATED':
        return <Sparkles className="w-4 h-4 text-[#7c3aed]" />;
      case 'EMAIL_ARCHIVED':
        return <Archive className="w-4 h-4 text-[#0b57d0]" />;
      case 'EMAIL_DELETED':
        return <Trash2 className="w-4 h-4 text-[#ea4335]" />;
      case 'EMAIL_STARRED':
        return <Star className="w-4 h-4 text-[#fbbc04]" />;
      case 'DRAFT_SAVED':
        return <FileEdit className="w-4 h-4 text-[#b06000]" />;
      default:
        return <CheckCircle className="w-4 h-4 text-[#0b57d0]" />;
    }
  };

  return (
    <AppShell>
      <Head>
        <title>Activity History — IntelliMail AI (Google Workspace)</title>
      </Head>

      <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full overflow-y-auto custom-scrollbar bg-[#ffffff]">
        {/* Header */}
        <div className="pb-5 border-b border-[#e0e2ec] mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal text-[#1f1f1f] tracking-tight flex items-center gap-2.5 font-['Google_Sans',sans-serif]">
              <ActivityIcon className="w-6 h-6 text-[#ea4335]" />
              <span>Activity History & Audit Log</span>
            </h1>
            <p className="text-xs text-[#5f6368] mt-1">
              Transparent audit trail of every AI interaction, sent email, and mailbox operation.
            </p>
          </div>

          <button
            onClick={fetchActivity}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#1a73e8]' : ''}`} />
          </button>
        </div>

        {/* Activity List */}
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1a73e8] mx-auto" />
            <p className="text-xs text-[#5f6368]">Loading audit log...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-3xl bg-[#ffffff] border border-[#dadce0]">
            <ActivityIcon className="w-8 h-8 text-[#5f6368] mx-auto" />
            <p className="text-sm font-medium text-[#202124]">No activities recorded yet</p>
            <p className="text-xs text-[#5f6368]">Actions you take in the workspace will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act._id || act.id}
                className="p-4 rounded-2xl bg-[#ffffff] border border-[#dadce0] shadow-sm flex items-start gap-3.5 text-xs transition-all hover:border-[#1a73e8]"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#f8fafd] border border-[#dadce0] flex items-center justify-center shrink-0 mt-0.5">
                  {getActionIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-[#202124] text-xs font-['Google_Sans',sans-serif]">
                      {act.description || act.type}
                    </p>
                    <span className="text-[11px] text-[#5f6368] font-mono">
                      {new Date(act.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {act.metadata && (
                    <div className="text-[11px] text-[#5f6368] flex items-center gap-2 flex-wrap">
                      {act.metadata.recipient && <span>To: {act.metadata.recipient}</span>}
                      {act.metadata.tone && <span>Tone: {act.metadata.tone}</span>}
                      {act.metadata.subject && <span className="truncate">Subject: {act.metadata.subject}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
