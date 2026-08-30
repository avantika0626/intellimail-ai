import React from 'react';
import { X, Trash2, Sliders, Sparkles, Mail, MessageSquare, Send, Table, GitBranch, Play } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, deleteNode, setSelectedNode } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <div className="w-80 bg-surface/95 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-500 select-none">
        <Sliders className="w-8 h-8 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300 mb-1">No Node Selected</h4>
        <p className="text-xs text-slate-500">
          Click any node on the canvas to configure parameters, credentials, and prompts.
        </p>
      </div>
    );
  }

  const { id, type, data = {} } = selectedNode;

  const handleChange = (key, value) => {
    updateNodeData(id, { [key]: value });
  };

  return (
    <div className="w-80 bg-surface/95 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Node Inspector</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => deleteNode(id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Delete Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node Label */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Step Label</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full glass-input rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary-500"
            placeholder="Step Name"
          />
        </div>

        {/* Node Type-Specific Fields */}
        {type === 'trigger' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Trigger Settings</h4>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Trigger Type</label>
              <select
                value={data.triggerType || 'manual'}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs bg-slate-900"
              >
                <option value="manual">Manual Execution</option>
                <option value="webhook">Webhook HTTP Endpoint</option>
                <option value="schedule">Cron Schedule</option>
                <option value="gmail">Gmail Inbound Poller</option>
              </select>
            </div>

            {data.triggerType === 'webhook' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Endpoint Path</label>
                <input
                  type="text"
                  value={data.endpoint || '/webhook/custom-event'}
                  onChange={(e) => handleChange('endpoint', e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            )}

            {data.triggerType === 'schedule' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cron Expression</label>
                <input
                  type="text"
                  value={data.cron || '*/15 * * * *'}
                  onChange={(e) => handleChange('cron', e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                  placeholder="*/15 * * * *"
                />
              </div>
            )}
          </div>
        )}

        {(type === 'ai-transform' || type === 'ai') && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">AI Reasoning Engine</h4>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Foundation Model</label>
              <select
                value={data.model || 'openrouter/gpt-4o-mini'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs bg-slate-900"
              >
                <option value="openrouter/gpt-4o-mini">OpenRouter / GPT-4o-mini</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Agent System Prompt</label>
              <textarea
                rows={4}
                value={data.systemPrompt || ''}
                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                placeholder="Instruct the agent on extraction, classification, or synthesis logic..."
              />
            </div>
          </div>
        )}

        {type === 'action' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-primary-400 uppercase tracking-wider">Integration Action</h4>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Provider</label>
              <select
                value={data.provider || 'slack'}
                onChange={(e) => handleChange('provider', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs bg-slate-900"
              >
                <option value="gmail">Gmail</option>
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
                <option value="google-sheets">Google Sheets</option>
              </select>
            </div>

            {/* Gmail config */}
            {data.provider === 'gmail' && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Recipient (To)</label>
                  <input
                    type="text"
                    value={data.to || ''}
                    onChange={(e) => handleChange('to', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs"
                    placeholder="user@example.com or {{from}}"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={data.subject || ''}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs"
                    placeholder="Email Subject"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Body Template</label>
                  <textarea
                    rows={3}
                    value={data.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="Supports {{variables}}..."
                  />
                </div>
              </>
            )}

            {/* Slack config */}
            {data.provider === 'slack' && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Channel</label>
                  <input
                    type="text"
                    value={data.channel || '#general'}
                    onChange={(e) => handleChange('channel', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs"
                    placeholder="#general"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Message Text</label>
                  <textarea
                    rows={3}
                    value={data.message || ''}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="Supports {{variables}}..."
                  />
                </div>
              </>
            )}

            {/* Discord config */}
            {data.provider === 'discord' && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Channel / Webhook ID</label>
                  <input
                    type="text"
                    value={data.channelId || 'ops-alerts'}
                    onChange={(e) => handleChange('channelId', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs"
                    placeholder="ops-alerts"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    value={data.message || ''}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="Supports {{variables}}..."
                  />
                </div>
              </>
            )}

            {/* Google Sheets config */}
            {data.provider === 'google-sheets' && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Spreadsheet ID</label>
                  <input
                    type="text"
                    value={data.spreadsheetId || ''}
                    onChange={(e) => handleChange('spreadsheetId', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="sheet_id_or_name"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Range</label>
                  <input
                    type="text"
                    value={data.range || 'Sheet1!A:Z'}
                    onChange={(e) => handleChange('range', e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="Sheet1!A:Z"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {type === 'condition' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Condition Evaluation</h4>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Context Field</label>
              <input
                type="text"
                value={data.field || 'totalAmount'}
                onChange={(e) => handleChange('field', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                placeholder="e.g. totalAmount"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Comparison Operator</label>
              <select
                value={data.operator || 'greater_than'}
                onChange={(e) => handleChange('operator', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs bg-slate-900"
              >
                <option value="greater_than">Greater than (&gt;)</option>
                <option value="less_than">Less than (&lt;)</option>
                <option value="equals">Equals (==)</option>
                <option value="contains">Contains substring</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Threshold / Value</label>
              <input
                type="text"
                value={data.threshold !== undefined ? data.threshold : 1000}
                onChange={(e) => handleChange('threshold', e.target.value)}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono"
                placeholder="1000"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
