import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ChevronLeft,
  Play,
  Pause,
  XCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Bot,
  Activity,
  Layers,
  Sparkles,
  Terminal,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import Timeline from '../../components/Timeline';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'output' | 'snapshot'

  const fetchExecutionData = async (execId) => {
    try {
      setLoading(true);
      const [execRes, timelineRes] = await Promise.all([
        api.get(`/executions/${execId}`),
        api.get(`/executions/${execId}/timeline`),
      ]);

      if (execRes.data?.success) setExecution(execRes.data.data);
      if (timelineRes.data?.success) setLogs(timelineRes.data.data);
    } catch (err) {
      console.error('Failed to load execution data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchExecutionData(id);
      joinExecutionRoom(id);

      const socket = getSocket();
      if (socket) {
        const handleNewLog = (event) => {
          if (event.executionId === id) {
            setLogs((prev) => [...prev, event]);
          }
        };

        const handleStatusUpdate = (event) => {
          if (event.executionId === id) {
            setExecution((prev) => (prev ? { ...prev, ...event } : prev));
          }
        };

        socket.on('execution:log', handleNewLog);
        socket.on('execution:status', handleStatusUpdate);

        return () => {
          leaveExecutionRoom(id);
          socket.off('execution:log', handleNewLog);
          socket.off('execution:status', handleStatusUpdate);
        };
      }
    }
  }, [id]);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      await api.post(`/executions/${id}/pause`);
      setExecution((prev) => ({ ...prev, status: 'PAUSED' }));
    } catch (err) {
      console.error('Failed to pause:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await api.post(`/executions/${id}/resume`);
      setExecution((prev) => ({ ...prev, status: 'RUNNING' }));
    } catch (err) {
      console.error('Failed to resume:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await api.post(`/executions/${id}/cancel`);
      setExecution((prev) => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/30 font-bold animate-pulse">
            <Activity className="w-3.5 h-3.5 animate-spin" /> RUNNING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
            <AlertOctagon className="w-3.5 h-3.5" /> FAILED
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            <Pause className="w-3.5 h-3.5" /> PAUSED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-bold">
            <XCircle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution Telemetry | Agentflow_AI</title>
        </Head>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/executions"
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-black tracking-tight text-slate-100">
                    {execution?.workflowSnapshot?.name || 'Execution Details'}
                  </h1>
                  {execution && getStatusBadge(execution.status)}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Run ID: {id} • Substrate: <span className="text-primary-400">LangGraph (available)</span>
                </p>
              </div>
            </div>

            {/* Execution Control Actions (Pause, Resume, Cancel) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchExecutionData(id)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                title="Refresh Timeline"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {execution?.status === 'RUNNING' && (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause Run
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Resume
                </button>
              )}

              {['RUNNING', 'PAUSED', 'PENDING', 'RETRYING'].includes(execution?.status) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</span>
              <p className="text-base font-bold text-slate-100 font-mono mt-0.5">
                {execution?.duration ? `${(execution.duration / 1000).toFixed(2)}s` : '0.00s'}
              </p>
            </div>

            <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Steps Planned</span>
              <p className="text-base font-bold text-slate-100 font-mono mt-0.5">
                {execution?.workflowSnapshot?.nodes?.length || 0} nodes
              </p>
            </div>

            <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Retry Backoffs</span>
              <p className="text-base font-bold text-slate-100 font-mono mt-0.5">
                {execution?.retryCount || 0} retries
              </p>
            </div>

            <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Agent</span>
              <p className="text-base font-bold text-primary-400 font-mono mt-0.5">
                {execution?.status === 'RUNNING' ? 'Execution Agent' : 'Audit Ready'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'timeline'
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40 shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live Agent Timeline ({logs.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('output')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'output'
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40 shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Outputs & Payloads
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('snapshot')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'snapshot'
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40 shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Runtime Snapshot
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'timeline' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl">
              <Timeline logs={logs} />
            </div>
          )}

          {activeTab === 'output' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Final Step Outputs</h3>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto">
                {JSON.stringify(execution?.outputs || {}, null, 2)}
              </pre>

              {execution?.error && (
                <div>
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Error Payload</h3>
                  <pre className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 font-mono overflow-x-auto">
                    {JSON.stringify(execution.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'snapshot' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Graph Nodes & Edges Snapshot</h3>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto">
                {JSON.stringify(execution?.workflowSnapshot || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
