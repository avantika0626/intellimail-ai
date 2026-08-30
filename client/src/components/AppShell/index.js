import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Workflow,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Bot,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import NotificationsDrawer from '../NotificationsDrawer';
import { joinUserRoom } from '../../services/socket';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, highlight: true },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Executions', href: '/executions', icon: PlayCircle },
  { name: 'Integrations', href: '/integrations', icon: Puzzle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppShell({ children, fullWidth = false }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      joinUserRoom(user.id);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background flex text-slate-100 antialiased">
      {/* Collapsible Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 bg-surface/95 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 select-none`}
      >
        {/* Brand & Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-glow-primary shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary-400 bg-clip-text text-transparent">
                    Agentflow_AI
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Agentic Orchestration</span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40 shadow-glow-primary'
                      : item.highlight
                      ? 'bg-gradient-to-r from-purple-500/10 to-primary-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-primary-400' : item.highlight ? 'text-purple-400' : 'text-slate-400'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {!collapsed && item.highlight && (
                    <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      AI Gen
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 ${collapsed ? 'flex-col' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-primary-400 font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Operator'}</p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-emerald-400" /> {user?.role || 'operator'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-surface/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Agent Runtime: <strong className="text-slate-200">Active</strong></span>
              <span className="text-slate-600">|</span>
              <span>LangGraph Substrate: <strong className="text-primary-400 font-mono">available</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick AI Builder Button */}
            <Link
              href="/workflows/builder"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-glow-primary transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate from Prompt
            </Link>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition relative"
              title="Execution Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className={`flex-1 overflow-y-auto ${fullWidth ? 'p-0 overflow-hidden' : 'p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
}
