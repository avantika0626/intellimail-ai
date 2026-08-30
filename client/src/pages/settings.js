import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/layout/AppShell';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bot,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  LogOut,
  Sliders,
  Mail,
  Zap,
} from 'lucide-react';
import { useMailStore } from '../store/mailStore';
import api from '../services/api';

const TONES = ['Professional', 'Friendly', 'Formal', 'Concise', 'Apologetic', 'Confident'];

export default function SettingsPage() {
  const { accountStatus, fetchAccountStatus } = useMailStore();
  const [preferences, setPreferences] = useState({
    defaultTone: 'Professional',
    summaryLength: 'concise',
    priorityEnabled: true,
    classificationEnabled: true,
    smartSearchEnabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
    api.get('/settings/preferences')
      .then((res) => {
        if (res.data.success) {
          setPreferences(res.data.data);
        }
      })
      .catch((err) => console.warn('Fetch prefs warning:', err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings/preferences', preferences);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Save preferences error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get('/gmail/oauth/url');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('OAuth URL error:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/gmail/account/disconnect');
      fetchAccountStatus();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  return (
    <AppShell>
      <Head>
        <title>Settings — IntelliMail AI (Google Workspace)</title>
      </Head>

      <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full overflow-y-auto custom-scrollbar bg-[#ffffff]">
        {/* Header */}
        <div className="pb-5 border-b border-[#e0e2ec] mb-6">
          <h1 className="text-2xl font-normal text-[#1f1f1f] tracking-tight flex items-center gap-2.5 font-['Google_Sans',sans-serif]">
            <SettingsIcon className="w-6 h-6 text-[#5f6368]" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Manage your Google Workspace account connection, configure AI defaults, and review privacy controls.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Connected Gmail Account */}
          <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#202124] font-['Google_Sans',sans-serif]">Google & Gmail Connection</h3>
                  <p className="text-[11px] text-[#5f6368]">OAuth 2.0 integration for real-time mailbox sync</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase font-mono border ${
                  accountStatus.isConnected
                    ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                    : 'bg-[#e8f0fe] text-[#0b57d0] border-[#c2e7ff]'
                }`}
              >
                {accountStatus.mode === 'live' ? 'Live Connected' : 'Sandbox (Demo Mode)'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8fafd] border border-[#dadce0] text-xs mb-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Active Mailbox Identifier</p>
                <p className="text-[#5f6368] font-mono text-[11px] mt-0.5">{accountStatus.email}</p>
              </div>

              {accountStatus.isConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-full bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] font-medium hover:bg-[#fad2cf] transition-colors"
                >
                  Disconnect Gmail
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium transition-all shadow-sm"
                >
                  Connect Real Gmail
                </button>
              )}
            </div>
          </div>

          {/* Section 2: AI Intelligence Preferences */}
          <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#202124] font-['Google_Sans',sans-serif]">Gemini AI Preferences</h3>
                <p className="text-[11px] text-[#5f6368]">Customize default reply tone and summary behaviors</p>
              </div>
            </div>

            {/* Default Tone */}
            <div>
              <label className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-2">
                Default Reply Tone
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, defaultTone: t })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                      preferences.defaultTone === t
                        ? 'bg-[#c2e7ff] text-[#001d35] font-bold border border-[#7fcfff]'
                        : 'bg-[#ffffff] border border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Length */}
            <div>
              <label className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-2">
                Default Summary Length
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {['concise', 'detailed'].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, summaryLength: len })}
                    className={`py-2 px-3 rounded-full text-xs font-medium uppercase transition-all ${
                      preferences.summaryLength === len
                        ? 'bg-[#0b57d0] text-white shadow-sm'
                        : 'bg-[#ffffff] border border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-2xl bg-[#f8fafd] border border-[#dadce0] flex items-start gap-3 text-xs text-[#5f6368]">
            <ShieldCheck className="w-5 h-5 text-[#137333] shrink-0" />
            <span>
              IntelliMail AI complies with zero-retention guidelines. AI drafts and suggestions are only committed to action when explicitly approved by the user. OAuth tokens are encrypted at rest using AES-256.
            </span>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {savedSuccess && (
                <span className="text-xs font-medium text-[#137333] flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Preferences saved successfully!</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-xs font-['Google_Sans',sans-serif] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
