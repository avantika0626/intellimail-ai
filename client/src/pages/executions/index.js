import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  PlayCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  PauseCircle,
  XCircle,
  Layers,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function ExecutionsIndexPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/executions', { params });
      if (res.data?.success) {
        setExecutions(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter, page]);

  // Listen to live execution status updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStatusUpdate = (event) => {
      setExecutions((prev) =>
        prev.map((item) =>
          (item._id === event.executionId || item.id === event.executionId)
            ? { ...item, status: event.status, duration: event.duration || item.duration }
            : item
        )
      );
    };

    socket.on('execution:status', handleStatusUpdate);
    return () => {
      socket.off('execution:status', handleStatusUpdate);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/30 font-semibold animate-pulse">
            <PlayCircle className="w-3 h-3 animate-spin" /> RUNNING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
            <AlertOctagon className="w-3 h-3" /> FAILED
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
            <PauseCircle className="w-3 h-3" /> PAUSED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
            <XCircle className="w-3 h-3" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution Runs | Agentflow_AI</title>
        </Head>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Workflow Executions</h1>
              <p className="text-xs text-slate-400 mt-1">
                Audit history, runtime metrics, and live agent telemetry logs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchExecutions}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="RUNNING">RUNNING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="PAUSED">PAUSED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Workflow Name</th>
                    <th className="px-6 py-4">Execution ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Started At</th>
                    <th className="px-6 py-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-primary-500" />
                        Loading executions...
                      </td>
                    </tr>
                  ) : executions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No execution records found.
                      </td>
                    </tr>
                  ) : (
                    executions.map((exec) => {
                      const execId = exec._id || exec.id;
                      return (
                        <tr key={execId} className="hover:bg-slate-900/40 transition">
                          <td className="px-6 py-4 font-bold text-slate-100 max-w-xs truncate">
                            {exec.workflowSnapshot?.name || 'Automated Workflow'}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                            {String(execId).slice(-8)}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(exec.status)}</td>
                          <td className="px-6 py-4 font-mono text-slate-400">
                            {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {exec.startTime ? new Date(exec.startTime).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/executions/${execId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-primary-600 hover:text-white text-slate-300 transition text-[11px] font-semibold"
                            >
                              Timeline <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
