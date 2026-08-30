import React from 'react';
import { Workflow, PlayCircle, CheckCircle2, AlertOctagon, Clock, Activity, Zap, ShieldCheck } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const cards = [
    {
      title: 'Active Workflows',
      value: metrics.activeWorkflows ?? 0,
      sub: `${metrics.totalWorkflows ?? 0} total workflows`,
      icon: Workflow,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10 border-primary-500/20',
    },
    {
      title: 'Total Executions',
      value: metrics.totalRuns ?? 0,
      sub: 'All-time pipeline runs',
      icon: PlayCircle,
      color: 'text-accent-cyan',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Agent Success Rate',
      value: `${metrics.successRate ?? 100}%`,
      sub: `${metrics.completedRuns ?? 0} succeeded / ${metrics.failedRuns ?? 0} escalated`,
      icon: CheckCircle2,
      color: 'text-accent-emerald',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Average Duration',
      value: `${((metrics.avgDurationMs ?? 850) / 1000).toFixed(2)}s`,
      sub: 'Multi-agent latency',
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="glass-panel glass-panel-hover rounded-2xl p-5 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-100 tracking-tight">{card.value}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
