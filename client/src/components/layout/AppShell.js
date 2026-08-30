import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ComposeModal from '../email/ComposeModal';
import { useAuthStore } from '../../store/authStore';
import { useMailStore } from '../../store/mailStore';

export default function AppShell({ children }) {
  const { initAuth } = useAuthStore();
  const { fetchAccountStatus } = useMailStore();

  useEffect(() => {
    initAuth();
    fetchAccountStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f] flex flex-col font-['Roboto',sans-serif] antialiased selection:bg-[#c2e7ff] selection:text-[#001d35]">
      {/* Top Google Mail Navigation */}
      <Header />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#ffffff] m-2 mr-3 rounded-2xl border border-[#e0e2ec] shadow-sm">
          {children}
        </main>
      </div>

      {/* Global Email Compose Overlay */}
      <ComposeModal />
    </div>
  );
}
