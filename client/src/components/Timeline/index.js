import React, { useState } from 'react';
import {
  Compass,
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Bot,
} from 'lucide-react';

export default function Timeline({ logs = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return {
          label: 'Planner Agent',
          icon: Compass,
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400',
        };
      case 'execution':
        return {
          label: 'Execution Agent',
          icon: Zap,
          bg: 'bg-primary-500/10 text-primary-400 border-primary-500/30',
          dot: 'bg-primary-500',
        };
      case 'validation':
        return {
          label: 'Validation Agent',
          icon: CheckCircle,
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'recovery':
        return {
          label: 'Recovery Agent',
          icon: AlertTriangle,
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'monitoring':
      default:
        return {
          label: 'Monitoring Agent',
          icon: Activity,
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
        };
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'success':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        <Bot className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
        No agent logs recorded yet. Run a workflow to stream live timeline events.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {logs.map((log, index) => {
        const badge = getAgentBadge(log.agent);
        const Icon = badge.icon;
        const isExp = expandedIndex === index;
        const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

        return (
          <div key={log._id || log.id || index} className="relative group">
            {/* Timeline node dot */}
            <div
              className={`absolute -left-6 top-3 w-3 h-3 rounded-full border-2 border-background ${badge.dot} shadow-md transition-transform group-hover:scale-125`}
            />

            <div className="glass-panel rounded-xl p-3.5 transition-all duration-150 hover:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-semibold ${badge.bg}`}>
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono border ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">{log.message}</p>

              {hasMetadata && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExp ? null : index)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-primary-400 transition font-mono"
                  >
                    {isExp ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>{isExp ? 'Hide metadata' : 'Inspect payload metadata'}</span>
                  </button>

                  {isExp && (
                    <pre className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
