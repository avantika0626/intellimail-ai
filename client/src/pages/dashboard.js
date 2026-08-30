import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/layout/AppShell';
import EmailList from '../components/email/EmailList';
import EmailViewer from '../components/email/EmailViewer';
import DailySummaryWidget from '../components/ai/DailySummaryWidget';
import { useAuthStore } from '../store/authStore';
import { useMailStore } from '../store/mailStore';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    fetchMessages,
    isListCollapsed,
    isDailySummaryCollapsed,
    toggleDailySummaryCollapsed,
  } = useMailStore();

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <AppShell>
      <Head>
        <title>Inbox — IntelliMail AI (Google Workspace)</title>
      </Head>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
        {/* Top Daily AI Summary Card (Collapsible) */}
        {!isDailySummaryCollapsed ? (
          <div className="p-2.5 border-b border-[#e0e2ec] bg-[#ffffff] shrink-0 relative group">
            <DailySummaryWidget />
            <button
              onClick={toggleDailySummaryCollapsed}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-[#5f6368] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors"
              title="Minimize Daily Overview"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="px-3 py-1 border-b border-[#e0e2ec] bg-[#f8fafd] flex items-center justify-between shrink-0 text-xs">
            <button
              onClick={toggleDailySummaryCollapsed}
              className="flex items-center gap-1.5 text-[#0b57d0] hover:text-[#0842a0] font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Show Today's AI Overview</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2-Pane Workspace: Email List & Email Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {!isListCollapsed && <EmailList />}
          <EmailViewer />
        </div>
      </div>
    </AppShell>
  );
}
