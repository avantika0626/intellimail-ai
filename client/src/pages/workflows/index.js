import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Workflow,
  Plus,
  Sparkles,
  Search,
  Copy,
  Trash2,
  Play,
  Layers,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../services/api';

export default function WorkflowsIndexPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/workflows', { params });
      if (res.data?.success) {
        setWorkflows(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleDuplicate = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      if (res.data?.success) {
        fetchWorkflows();
      }
    } catch (err) {
      console.error('Failed to duplicate workflow:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows((prev) => prev.filter((w) => (w._id || w.id) !== id));
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleQuickExecute = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/execute`, { inputs: { trigger: 'manual_operator_click' } });
      if (res.data?.success) {
        const executionId = res.data.data._id || res.data.data.id;
        router.push(`/executions/${executionId}`);
      }
    } catch (err) {
      console.error('Failed to execute workflow:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Workflows Directory | Agentflow_AI</title>
        </Head>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Workflows Directory</h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage, edit, version, and execute visual AI automation graphs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/workflows/builder"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-primary transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Prompt Generator
              </Link>

              <Link
                href="/workflows/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-glow-primary transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Blank Canvas
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows by title or description..."
                className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Workflow Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              <Workflow className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-200 mb-1">No Workflows Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                Get started by generating your first workflow using our natural language AI generator.
              </p>
              <Link
                href="/workflows/builder"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate from Prompt
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((wf) => {
                const wfId = wf._id || wf.id;
                return (
                  <div
                    key={wfId}
                    className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 border border-slate-800 hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-primary-500/10 text-primary-400 border border-primary-500/30">
                          v{wf.version || 1} • {wf.status || 'active'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(e, wfId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, wfId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 line-clamp-1 mb-1">{wf.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {wf.description || 'Automated multi-agent execution pipeline'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between gap-2 mb-3 text-[11px] text-slate-500 font-mono">
                        <span>{wf.nodes?.length || 0} nodes / {wf.edges?.length || 0} edges</span>
                        <span>{wf.tags?.slice(0, 2).join(', ') || 'automation'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/workflows/${wfId}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          <Workflow className="w-3.5 h-3.5" />
                          Open Canvas
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleQuickExecute(e, wfId)}
                          className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition"
                          title="Execute Run Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
