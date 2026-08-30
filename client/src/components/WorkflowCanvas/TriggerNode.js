import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Webhook, Clock, Mail, Zap } from 'lucide-react';

const TriggerNode = ({ data, selected }) => {
  const triggerType = data.triggerType || 'manual';

  const getIcon = () => {
    switch (triggerType) {
      case 'webhook':
        return <Webhook className="w-4 h-4 text-accent-cyan" />;
      case 'schedule':
        return <Clock className="w-4 h-4 text-accent-amber" />;
      case 'gmail':
        return <Mail className="w-4 h-4 text-accent-rose" />;
      default:
        return <Play className="w-4 h-4 text-accent-emerald" />;
    }
  };

  const getBadgeColor = () => {
    switch (triggerType) {
      case 'webhook':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'schedule':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'gmail':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div
      className={`relative min-w-[220px] rounded-xl p-4 transition-all duration-200 border ${
        selected
          ? 'bg-slate-900/95 border-emerald-500 shadow-glow-emerald'
          : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            {getIcon()}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Trigger</span>
            <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{data.label || 'Workflow Trigger'}</h4>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-mono ${getBadgeColor()}`}>
          {triggerType.toUpperCase()}
        </span>
        {data.endpoint && (
          <span className="text-[11px] text-slate-400 truncate max-w-[120px] font-mono">
            {data.endpoint}
          </span>
        )}
      </div>

      {/* Target handle not needed for root trigger */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900"
      />
    </div>
  );
};

export default memo(TriggerNode);
