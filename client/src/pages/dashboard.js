import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/layout/AppShell';
import EmailList from '../components/email/EmailList';
import EmailViewer from '../components/email/EmailViewer';
import DailySummaryWidget from '../components/ai/DailySummaryWidget';
import { useAuthStore } from '../store/authStore';
import { useMailStore } from '../store/mailStore';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchMessages } = useMailStore();

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <AppShell>
      <Head>
        <title>Inbox — IntelliMail AI (Google Workspace)</title>
      </Head>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
        {/* Top Daily AI Summary Card */}
        <div className="p-3 border-b border-[#e0e2ec] bg-[#ffffff] shrink-0">
          <DailySummaryWidget />
        </div>

        {/* 2-Pane Workspace: Email List & Email Viewer */}
        <div className="flex-1 flex overflow-hidden">
          <EmailList />
          <EmailViewer />
        </div>
      </div>
    </AppShell>
  );
}
