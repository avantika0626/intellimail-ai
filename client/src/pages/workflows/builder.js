import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Sparkles,
  Play,
  Save,
  RotateCcw,
  Bot,
  ArrowRight,
  Loader2,
  CheckCircle,
  Cpu,
  Layers,
  ExternalLink,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
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

const SAMPLE_PROMPTS = [
  'Extract invoices from webhook, evaluate if amount > $1,000, alert Slack #approvals, and log to Google Sheets',
  'Poll unread customer emails in Gmail, analyze priority with AI reasoning, send auto-reply, and sync to Sheets',
  'Receive incident alerts via webhook, format message with AI, and broadcast to Slack and Discord channels',
];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const {
    nodes,
    edges,
    workflowName,
    workflowDescription,
    tags,
    setFullWorkflow,
    setNodes,
    setEdges,
    setWorkflowMeta,
    resetWorkflow,
  } = useWorkflowStore();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationSource, setGenerationSource] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGenerate = async (targetPrompt) => {
    const queryPrompt = targetPrompt || prompt;
    if (!queryPrompt.trim()) return;

    try {
      setIsGenerating(true);
      setSaveSuccess(false);
      const res = await api.post('/workflows/generate', { prompt: queryPrompt });
      
      if (res.data?.success) {
        const generated = res.data.data;
        setFullWorkflow({
          name: generated.name || 'AI Generated Automation',
          description: generated.description || queryPrompt,
          tags: generated.tags || ['ai-generated'],
          nodes: generated.nodes || [],
          edges: generated.edges || [],
        });
        setGenerationSource(generated.generatedBy || 'ai-engine');
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/workflows', {
        name: workflowName || 'AI Generated Workflow',
        description: workflowDescription || prompt,
        tags: tags || ['ai-generated'],
        nodes,
        edges,
      });

      if (res.data?.success) {
        setSaveSuccess(true);
        const newId = res.data.data._id || res.data.data.id;
        setTimeout(() => {
          router.push(`/workflows/${newId}`);
        }, 800);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteNow = async () => {
    try {
      // First save or get ID
      const saveRes = await api.post('/workflows', {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
      });
      const wfId = saveRes.data.data._id || saveRes.data.data.id;
      
      // Execute
      const execRes = await api.post(`/workflows/${wfId}/execute`, { inputs: { trigger: 'builder_instant_run' } });
      const execId = execRes.data.data._id || execRes.data.data.id;
      router.push(`/executions/${execId}`);
    } catch (err) {
      console.error('Failed to execute workflow:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell fullWidth>
        <Head>
          <title>Prompt-to-Workflow AI Studio | Agentflow_AI</title>
        </Head>

        <div className="h-full flex flex-col bg-background">
          {/* Top Prompt Input & Generation Panel */}
          <div className="p-4 bg-surface/90 border-b border-slate-800 backdrop-blur shrink-0 space-y-3 z-10 shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-3">
              {/* Natural Language Prompt Input */}
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Describe your automation in plain English (e.g. Ingest invoices, alert Slack, sync Sheets)..."
                  className="w-full glass-input rounded-xl pl-9 pr-24 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-glow-primary"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveWorkflow}
                  disabled={isSaving || nodes.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saveSuccess ? 'Saved!' : 'Save Workflow'}
                </button>

                <button
                  type="button"
                  onClick={handleExecuteNow}
                  disabled={nodes.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-glow-emerald transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Multi-Agent Chain
                </button>

                <button
                  type="button"
                  onClick={resetWorkflow}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                  title="Clear Canvas"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400 pb-1">
              <span className="shrink-0 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Try template:</span>
              {SAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    handleGenerate(p);
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition truncate max-w-xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas View Area */}
          <div className="flex-1 relative overflow-hidden">
            <WorkflowCanvas />

            {/* Floating Telemetry Badge */}
            {generationSource && (
              <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1.5 rounded-xl text-[11px] text-slate-300 flex items-center gap-2 border border-slate-700/80 font-mono shadow-xl">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Engine: <strong className="text-purple-300">{generationSource}</strong></span>
                <span className="text-slate-600">•</span>
                <span>{nodes.length} Nodes Materialized</span>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
