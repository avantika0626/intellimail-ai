import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Save,
  Play,
  Copy,
  ChevronLeft,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Workflow as WorkflowIcon,
  Tag,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';

const WorkflowCanvas = dynamic(() => import('../../components/WorkflowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
    </div>
  ),
});

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    nodes,
    edges,
    workflowName,
    workflowDescription,
    version,
    status,
    tags,
    setFullWorkflow,
    setWorkflowMeta,
  } = useWorkflowStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const fetchWorkflow = async (wfId) => {
    try {
      setLoading(true);
      const res = await api.get(`/workflows/${wfId}`);
      if (res.data?.success) {
        setFullWorkflow(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'new') {
      fetchWorkflow(id);
    } else if (id === 'new') {
      setFullWorkflow({
        name: 'New Custom Workflow',
        description: 'Multi-agent automated graph',
        nodes: [
          {
            id: 'node-trigger-1',
            type: 'trigger',
            position: { x: 100, y: 150 },
            data: { label: 'Manual Trigger', triggerType: 'manual' },
          },
        ],
        edges: [],
        version: 1,
        status: 'active',
      });
      setLoading(false);
    }
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (id === 'new') {
        const res = await api.post('/workflows', {
          name: workflowName,
          description: workflowDescription,
          nodes,
          edges,
          tags,
          status,
        });
        if (res.data?.success) {
          const newId = res.data.data._id || res.data.data.id;
          router.replace(`/workflows/${newId}`);
        }
      } else {
        await api.put(`/workflows/${id}`, {
          name: workflowName,
          description: workflowDescription,
          nodes,
          edges,
          tags,
          status,
        });
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      // Auto-save changes before running
      if (id !== 'new') {
        await api.put(`/workflows/${id}`, {
          name: workflowName,
          description: workflowDescription,
          nodes,
          edges,
        });
      }

      const execWfId = id === 'new' ? (await api.post('/workflows', { name: workflowName, nodes, edges })).data.data.id : id;
      const res = await api.post(`/workflows/${execWfId}/execute`, { inputs: { source: 'editor_studio' } });
      
      if (res.data?.success) {
        const execId = res.data.data._id || res.data.data.id;
        router.push(`/executions/${execId}`);
      }
    } catch (err) {
      console.error('Failed to execute workflow:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell fullWidth>
        <Head>
          <title>{workflowName || 'Workflow Editor'} | Agentflow_AI</title>
        </Head>

        <div className="h-full flex flex-col bg-background overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-14 bg-surface/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-10 backdrop-blur">
            <div className="flex items-center gap-3">
              <Link
                href="/workflows"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Back to workflows"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowMeta({ name: e.target.value })}
                  className="bg-transparent border border-transparent hover:border-slate-700 focus:border-primary-500 rounded px-2 py-1 text-sm font-bold text-slate-100 outline-none transition"
                />
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  v{version}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {saveToast && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium mr-2">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>

              <button
                type="button"
                onClick={handleExecute}
                disabled={executing || nodes.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-glow-emerald transition"
              >
                {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run Agents
              </button>
            </div>
          </div>

          {/* Editor Workspace: Palette | Canvas | Config */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Draggable Node Palette */}
            <NodePalette />

            {/* Center: React Flow Canvas */}
            <div className="flex-1 relative h-full">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : (
                <WorkflowCanvas />
              )}
            </div>

            {/* Right: Inspector / Node Configuration */}
            <NodeConfigPanel />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
