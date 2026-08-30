import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  Sparkles,
  Settings,
  HelpCircle,
  Grid,
  Menu,
  SlidersHorizontal,
  LogOut,
  BarChart3,
  Activity,
  BookOpen,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMailStore } from '../../store/mailStore';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery, isSmartSearch, setIsSmartSearch, fetchMessages, accountStatus } = useMailStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages({ query: searchQuery });
  };

  return (
    <header className="h-16 px-4 bg-[#f6f8fc] border-b border-[#e0e2ec] flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Hamburger + Google Mail Brand */}
      <div className="flex items-center gap-4 min-w-[240px]">
        <button
          type="button"
          className="p-2.5 rounded-full hover:bg-[#e0e2ec] text-[#444746] transition-colors"
          title="Main menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 group">
          {/* Authentic Gmail Multicolor Envelope SVG */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7">
              <path fill="#4285F4" d="M1.5 5.5v13a2 2 0 0 0 2 2h1.5V9.75L12 14.5l7-4.75V20.5H20.5a2 2 0 0 0 2-2v-13a2 2 0 0 0-3.11-1.66L12 9 4.61 3.84A2 2 0 0 0 1.5 5.5z" />
              <path fill="#34A853" d="M3.5 20.5h2V10.25l-2-1.36V20.5z" />
              <path fill="#EA4335" d="M20.5 20.5h-2V10.25l2-1.36V20.5z" />
              <path fill="#FBBC04" d="M12 9l7.39-5.16A2 2 0 0 0 18.5 3.5H5.5a2 2 0 0 0-.89.34L12 9z" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[21px] font-normal tracking-tight text-[#444746] font-['Google_Sans',sans-serif]">
              IntelliMail
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#c2e7ff] text-[#001d35]">
              AI
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Signature Google Mail Search Pill */}
      <div className="flex-1 max-w-2xl mx-4">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <button
            type="submit"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-[#444746] hover:text-[#1f1f1f] transition-colors"
          >
            {isSmartSearch ? (
              <Sparkles className="w-5 h-5 text-[#7c3aed] animate-pulse" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isSmartSearch
                ? 'Ask AI: "Emails with deadlines this week" or "Invoices over $500"...'
                : 'Search in mail'
            }
            className={`w-full h-11 pl-12 pr-28 rounded-full text-sm font-normal transition-all focus:outline-none focus:shadow-md ${
              isSmartSearch
                ? 'bg-[#f3e8ff] text-[#4c1d95] placeholder-[#7e22ce]/60 border border-[#c084fc] shadow-sm'
                : 'bg-[#eaf1fb] text-[#1f1f1f] placeholder-[#444746] border border-transparent focus:bg-[#ffffff] focus:border-[#dadce0]'
            }`}
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSmartSearch(!isSmartSearch)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSmartSearch
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'bg-white text-[#444746] hover:bg-[#dfe4ea] border border-[#dadce0]'
              }`}
              title="Toggle AI Semantic Search"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart AI</span>
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className="p-1.5 rounded-full hover:bg-[#dfe4ea] text-[#444746]"
              title="Search options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Right: Status Badge + Google Workspace Icons & Profile */}
      <div className="flex items-center gap-2">
        {/* Google OAuth Live Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] border border-[#c2e7ff] text-xs text-[#0b57d0]">
          <div className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-pulse" />
          <span className="font-medium truncate max-w-[150px]">{accountStatus.email || 'Gmail Ready'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-mono text-[#0b57d0] border border-[#c2e7ff] uppercase">
            {accountStatus.mode}
          </span>
        </div>

        <Link
          href="/settings"
          className="p-2.5 rounded-full hover:bg-[#e0e2ec] text-[#444746] transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <Link
          href="/analytics"
          className="p-2.5 rounded-full hover:bg-[#e0e2ec] text-[#444746] transition-colors"
          title="Google Apps"
        >
          <Grid className="w-5 h-5" />
        </Link>

        {/* Google Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-full bg-[#0b57d0] hover:ring-4 hover:ring-[#c2e7ff] transition-all flex items-center justify-center text-white font-medium text-sm ml-1"
            title="Google Account"
          >
            {user?.name?.[0]?.toUpperCase() || 'O'}
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-[#1f1f1f]"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-3 border-b border-[#f1f3f4] text-center mb-1">
                <div className="w-12 h-12 rounded-full bg-[#0b57d0] text-white flex items-center justify-center text-lg font-medium mx-auto mb-2 shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || 'O'}
                </div>
                <p className="text-sm font-medium text-[#202124]">{user?.name || 'Operator'}</p>
                <p className="text-xs text-[#5f6368] truncate">{user?.email || 'operator@intellimail.io'}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#1a73e8]" />
                  <span>Inbox Workspace</span>
                </Link>

                <Link
                  href="/analytics"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#1e8e3e]" />
                  <span>Email Analytics</span>
                </Link>

                <Link
                  href="/activity"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                >
                  <Activity className="w-4 h-4 text-[#ea4335]" />
                  <span>Activity History</span>
                </Link>

                <Link
                  href="/templates"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#fbbc04]" />
                  <span>Email Templates</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#5f6368]" />
                  <span>Settings & Preferences</span>
                </Link>
              </div>

              <div className="border-t border-[#f1f3f4] my-1" />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  router.push('/login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-medium text-[#d93025] hover:bg-[#fce8e6] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
