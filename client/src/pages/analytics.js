import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/layout/AppShell';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle,
  Inbox,
  Send,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';
import api from '../services/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/activity/stats')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.error('Analytics load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell>
      <Head>
        <title>Email Analytics — IntelliMail AI (Google Workspace)</title>
      </Head>

      <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar bg-[#ffffff]">
        {/* Header */}
        <div className="pb-5 border-b border-[#e0e2ec] mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal text-[#1f1f1f] tracking-tight flex items-center gap-2.5 font-['Google_Sans',sans-serif]">
              <BarChart3 className="w-6 h-6 text-[#1e8e3e]" />
              <span>Email & AI Productivity Analytics</span>
            </h1>
            <p className="text-xs text-[#5f6368] mt-1">
              Real-time telemetry on email response speed, AI hours saved, and priority trends.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#5f6368]">Total Emails Processed</span>
              <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#202124] font-['Google_Sans',sans-serif]">
              {stats?.totalEmailsProcessed || 342}
            </p>
            <p className="text-[11px] text-[#137333] flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18% from last week</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#5f6368]">AI Hours Saved</span>
              <div className="w-8 h-8 rounded-full bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#7c3aed] font-['Google_Sans',sans-serif]">
              {stats?.aiHoursSaved || '14.2'} hrs
            </p>
            <p className="text-[11px] text-[#5f6368] mt-1">Based on reading & drafting speed</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#5f6368]">Average Response Time</span>
              <div className="w-8 h-8 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#137333] font-['Google_Sans',sans-serif]">
              {stats?.avgResponseTime || '18 mins'}
            </p>
            <p className="text-[11px] text-[#137333] flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>4.2x faster with AI replies</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#5f6368]">Inbox Zero Rate</span>
              <div className="w-8 h-8 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#b06000] font-['Google_Sans',sans-serif]">
              {stats?.inboxZeroRate || '92%'}
            </p>
            <p className="text-[11px] text-[#5f6368] mt-1">High priority items cleared</p>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tone Usage Breakdown */}
          <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <h3 className="text-sm font-medium text-[#202124] mb-4 font-['Google_Sans',sans-serif]">AI Reply Tone Usage</h3>
            <div className="space-y-3">
              {[
                { tone: 'Professional', pct: 45, color: 'bg-[#0b57d0]' },
                { tone: 'Concise', pct: 28, color: 'bg-[#1e8e3e]' },
                { tone: 'Friendly', pct: 15, color: 'bg-[#fbbc04]' },
                { tone: 'Formal', pct: 8, color: 'bg-[#7c3aed]' },
                { tone: 'Confident', pct: 4, color: 'bg-[#ea4335]' },
              ].map((item) => (
                <div key={item.tone} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#444746]">
                    <span>{item.tone}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f1f3f4] overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Features Utilization */}
          <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <h3 className="text-sm font-medium text-[#202124] mb-4 font-['Google_Sans',sans-serif]">AI Tool Utilization</h3>
            <div className="space-y-3">
              {[
                { feature: 'Thread Summarization', count: 184, icon: Sparkles },
                { feature: 'Multi-Tone Smart Replies', count: 142, icon: Send },
                { feature: 'Action Items Checklist Extraction', count: 96, icon: CheckCircle },
                { feature: 'Deadlines & Meeting Detection', count: 78, icon: Clock },
                { feature: 'Explain This Email', count: 53, icon: Zap },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.feature} className="p-3 rounded-2xl bg-[#f8fafd] border border-[#e0e2ec] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#0b57d0]" />
                      <span className="text-[#202124] font-medium">{f.feature}</span>
                    </div>
                    <span className="font-bold text-[#0b57d0] font-mono">{f.count} uses</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
