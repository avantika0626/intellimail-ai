import React, { useState } from 'react';
import {
  Play,
  Webhook,
  Clock,
  Sparkles,
  Mail,
  MessageSquare,
  Send,
  Table,
  GitBranch,
  Timer,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const PALETTE_CATEGORIES = [
  {
    name: 'Triggers',
    color: 'text-emerald-400',
    items: [
      {
        type: 'trigger',
        label: 'Manual Trigger',
        icon: Play,
        badge: 'Trigger',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        defaultData: { triggerType: 'manual', description: 'Run workflow on-demand via button or API' },
      },
      {
        type: 'trigger',
        label: 'Webhook Ingest',
        icon: Webhook,
        badge: 'Trigger',
        badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        defaultData: { triggerType: 'webhook', endpoint: '/webhook/custom-event', method: 'POST' },
      },
      {
        type: 'trigger',
        label: 'Schedule Cron',
        icon: Clock,
        badge: 'Trigger',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        defaultData: { triggerType: 'schedule', cron: '*/15 * * * *' },
      },
      {
        type: 'trigger',
        label: 'Gmail Poller',
        icon: Mail,
        badge: 'Trigger',
        badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        defaultData: { triggerType: 'gmail', query: 'is:unread label:inbox' },
      },
    ],
  },
  {
    name: 'AI & Reasoning',
    color: 'text-purple-400',
    items: [
      {
        type: 'ai-transform',
        label: 'AI Reasoning Agent',
        icon: Sparkles,
        badge: 'AI Agent',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        defaultData: {
          model: 'openrouter/gpt-4o-mini',
          systemPrompt: 'Analyze incoming text, extract key entities, sentiment, and synthesize structured JSON output.',
          action: 'reasoning',
        },
      },
      {
        type: 'ai-transform',
        label: 'Data Extractor / OCR',
        icon: Sparkles,
        badge: 'AI Agent',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        defaultData: {
          model: 'gemini-1.5-flash',
          systemPrompt: 'Extract invoice numbers, vendor, line items, and totals into strict schema.',
          action: 'extract_entities',
        },
      },
    ],
  },
  {
    name: 'Integrations & Actions',
    color: 'text-primary-400',
    items: [
      {
        type: 'action',
        label: 'Send Gmail Email',
        icon: Mail,
        badge: 'Gmail',
        badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        defaultData: {
          provider: 'gmail',
          actionType: 'send_email',
          to: 'customer@company.com',
          subject: 'Automation update: {{subject}}',
          body: 'Hello, your automation workflow has completed successfully.',
        },
      },
      {
        type: 'action',
        label: 'Slack Post Message',
        icon: MessageSquare,
        badge: 'Slack',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        defaultData: {
          provider: 'slack',
          actionType: 'post_message',
          channel: '#ops-alerts',
          message: '🚀 Workflow execution completed successfully.',
        },
      },
      {
        type: 'action',
        label: 'Discord Broadcast',
        icon: Send,
        badge: 'Discord',
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        defaultData: {
          provider: 'discord',
          actionType: 'post_message',
          channelId: 'announcements',
          message: '📢 Operational notification from Agentflow_AI.',
        },
      },
      {
        type: 'action',
        label: 'Google Sheets Append',
        icon: Table,
        badge: 'Sheets',
        badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        defaultData: {
          provider: 'google-sheets',
          actionType: 'append_row',
          spreadsheetId: 'ops_audit_log',
          range: 'Sheet1!A:Z',
        },
      },
    ],
  },
  {
    name: 'Logic & Flow Controls',
    color: 'text-amber-400',
    items: [
      {
        type: 'condition',
        label: 'Branching Condition',
        icon: GitBranch,
        badge: 'Logic',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        defaultData: {
          field: 'totalAmount',
          operator: 'greater_than',
          threshold: 1000,
        },
      },
      {
        type: 'delay',
        label: 'Delay Step',
        icon: Timer,
        badge: 'Timing',
        badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        defaultData: { seconds: 2 },
      },
    ],
  },
];

export default function NodePalette() {
  const { addNode, nodes } = useWorkflowStore();
  const [expanded, setExpanded] = useState({
    Triggers: true,
    'AI & Reasoning': true,
    'Integrations & Actions': true,
    'Logic & Flow Controls': true,
  });

  const toggleCategory = (cat) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData('application/agentflow-node', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = (item) => {
    const xPos = 100 + (nodes.length % 4) * 260;
    const yPos = 150 + Math.floor(nodes.length / 4) * 160;

    addNode({
      id: `node-${Date.now()}`,
      type: item.type,
      position: { x: xPos, y: yPos },
      data: {
        label: item.label,
        ...item.defaultData,
      },
    });
  };

  return (
    <div className="w-72 bg-surface/95 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Node Palette</h3>
          <p className="text-xs text-slate-400">Drag or click + to add</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {PALETTE_CATEGORIES.map((category) => {
          const isExp = expanded[category.name];
          return (
            <div key={category.name} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white uppercase tracking-wider py-1 px-1"
              >
                <span className={category.color}>{category.name}</span>
                {isExp ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {isExp && (
                <div className="space-y-1.5 pl-1">
                  {category.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className="group flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-primary-500/50 hover:bg-slate-800/60 cursor-grab active:cursor-grabbing transition-all text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                          <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700/80">
                            <Icon className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                          <span className="font-medium truncate">{item.label}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Add to canvas"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
