import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Mail,
  MessageSquare,
  Send,
  Table,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  RefreshCw,
  Lock,
  Key,
  ToggleLeft,
  ToggleRight,
  Sliders,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../services/api';

const INTEGRATION_META = {
  gmail: {
    name: 'Gmail',
    icon: Mail,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    description: 'Read unread inbox messages, parse incoming inquiries, and send automated email replies.',
    actions: ['send_email', 'read_email'],
  },
  slack: {
    name: 'Slack',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Post automated messages, alerts, and interactive approvals to public or private channels.',
    actions: ['post_message', 'notify_channel'],
  },
  discord: {
    name: 'Discord',
    icon: Send,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/30',
    description: 'Broadcast alerts and status messages to developer servers and webhook endpoints.',
    actions: ['post_message'],
  },
  'google-sheets': {
    name: 'Google Sheets',
    icon: Table,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    description: 'Append rows, update spreadsheets, and read structured data ranges for automated auditing.',
    actions: ['append_row', 'read_range'],
  },
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      if (res.data?.success) {
        setIntegrations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOAuthConnect = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.data?.authUrl) {
        // Direct browser or simulate sandbox connection
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      console.error('OAuth initiation failed:', err);
    }
  };

  const handleManualToggle = async (provider, currentStatus) => {
    try {
      const res = await api.post('/integrations', {
        provider,
        isConnected: !currentStatus,
        accessToken: !currentStatus ? `simulated_token_${provider}_${Date.now()}` : null,
        accountEmail: !currentStatus ? `operator-${provider}@agentflow.io` : null,
      });

      if (res.data?.success) {
        fetchIntegrations();
      }
    } catch (err) {
      console.error('Failed to update integration:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Third-Party Integrations | Agentflow_AI</title>
        </Head>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Third-Party Integrations</h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage OAuth connections and encrypted credentials (AES-256-GCM at rest).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchIntegrations}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>
          </div>

          {/* Security Guarantee Banner */}
          <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10 flex items-center gap-3 text-xs text-emerald-300">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Encrypted at Rest</span>: All access and refresh tokens are encrypted using application-level AES-256-GCM prior to database persistence. Decrypted secrets are never logged in raw telemetry.
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(INTEGRATION_META).map(([key, meta]) => {
              const liveData = integrations.find((i) => i.provider === key);
              const isConnected = liveData?.isConnected ?? false;
              const Icon = meta.icon;

              return (
                <div
                  key={key}
                  className={`glass-panel rounded-2xl p-6 border transition-all duration-200 ${
                    isConnected ? 'border-emerald-500/30 bg-slate-900/90' : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${meta.bg}`}>
                        <Icon className={`w-6 h-6 ${meta.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-100">{meta.name}</h3>
                          {isConnected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              Disconnected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {liveData?.accountEmail || (isConnected ? 'Active Sandbox Connection' : 'No credential active')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleManualToggle(key, isConnected)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                      title={isConnected ? 'Disconnect' : 'Connect Sandbox'}
                    >
                      {isConnected ? (
                        <ToggleRight className="w-7 h-7 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-600" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{meta.description}</p>

                  <div className="space-y-2 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available Actions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.actions.map((act) => (
                        <span
                          key={act}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleOAuthConnect(key)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {isConnected ? 'Reconnect OAuth' : 'Start OAuth Flow'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleManualToggle(key, isConnected)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isConnected
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald'
                      }`}
                    >
                      {isConnected ? 'Disconnect' : 'Quick Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
